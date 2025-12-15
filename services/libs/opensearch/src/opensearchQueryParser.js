"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpensearchQueryParser = void 0;
const types_1 = require("@gitmesh/types");
class OpensearchQueryParser {
    static parse(criteria, index, translator) {
        const query = this.parseFilters(criteria.filter, index, translator);
        const from = criteria.offset;
        const size = criteria.limit;
        // sorting comes with the form `joinedAt_DESC`
        const sorterSplit = criteria.orderBy.split('_');
        let sortField = translator.gitmeshToOpensearch(sorterSplit[0]);
        if (sortField === 'string_displayName') {
            sortField = 'keyword_displayName';
        }
        const sort = [
            {
                [sortField]: sorterSplit[1].toLowerCase(),
            },
        ];
        return { query, from, size, sort };
    }
    static parseFilters(filters, index, translator) {
        const query = {
            bool: {
                must: [],
            },
        };
        const keys = Object.keys(filters);
        for (const key of keys) {
            if (this.isOperator(key)) {
                const operands = [];
                for (const operand of filters[key]) {
                    operands.push(this.parseFilters(operand, index, translator));
                }
                const op = this.getOpensearchOperator(key);
                if (op === 'must') {
                    query.bool.must.push(...operands);
                }
                else {
                    query.bool.must.push({
                        bool: {
                            [op]: [...operands],
                        },
                    });
                }
            }
            else if (key === types_1.Operator.NOT) {
                query.bool = {
                    must_not: this.parseFilters(filters[key], index, translator),
                };
            }
            else if (translator.fieldExists(key)) {
                const searchKey = translator.gitmeshToOpensearch(key);
                if (translator.isNestedField(searchKey)) {
                    // Extract the path to the nested object
                    const nestedPath = searchKey.split('.')[0];
                    query.bool.must.push({
                        nested: {
                            path: nestedPath,
                            query: this.parseColumnCondition(filters[key], searchKey),
                        },
                    });
                }
                else {
                    query.bool.must.push(this.parseColumnCondition(filters[key], searchKey));
                }
            }
            else {
                throw new Error(`Unknown field or operator: ${key}!`);
            }
        }
        return query;
    }
    static isOperator(opOrCondition) {
        const lower = opOrCondition.toLowerCase().trim();
        return lower === 'and' || lower === 'or';
    }
    static getOpensearchOperator(operator) {
        const lower = operator.toLowerCase().trim();
        if (lower === 'and') {
            return 'must';
        }
        if (lower === 'or') {
            return 'should';
        }
        throw new Error('Bad op!');
    }
    static parseColumnCondition(filters, searchKey) {
        const conditionKeys = Object.keys(filters);
        if (conditionKeys.length !== 1) {
            throw new Error(`Invalid condition! ${JSON.stringify(filters, undefined, 2)}`);
        }
        const operator = conditionKeys[0];
        let value = filters[operator];
        if (typeof value === 'string' && !searchKey.startsWith('date')) {
            value = value.toLowerCase();
        }
        if (operator === types_1.Operator.EQUAL) {
            if (value === null) {
                return {
                    bool: {
                        must_not: {
                            exists: {
                                field: searchKey,
                            },
                        },
                    },
                };
            }
            return {
                term: {
                    [searchKey]: value,
                },
            };
        }
        if ([
            types_1.Operator.LESS_THAN,
            types_1.Operator.LESS_THAN_OR_EQUAL,
            types_1.Operator.GREATER_THAN,
            types_1.Operator.GREATER_THAN_OR_EQUAL,
        ].includes(operator)) {
            return {
                range: {
                    [searchKey]: {
                        [operator]: value,
                    },
                },
            };
        }
        if (operator === types_1.Operator.LIKE || operator === types_1.Operator.TEXT_CONTAINS) {
            return {
                wildcard: {
                    [searchKey]: {
                        value: `*${value}*`,
                    },
                },
            };
        }
        if (operator === types_1.Operator.NOT || operator === types_1.Operator.NOT_EQUAL) {
            if (value === null) {
                return {
                    exists: {
                        field: searchKey,
                    },
                };
            }
            return {
                bool: {
                    must_not: {
                        term: {
                            [searchKey]: value,
                        },
                    },
                },
            };
        }
        if (operator === types_1.Operator.NOT_LIKE || operator === types_1.Operator.NOT_TEXT_CONTAINS) {
            return {
                bool: {
                    must_not: {
                        wildcard: {
                            [searchKey]: {
                                value: `*${value}*`,
                            },
                        },
                    },
                },
            };
        }
        if (operator === types_1.Operator.BETWEEN) {
            return {
                range: {
                    [searchKey]: {
                        gte: value[0],
                        lte: value[1],
                    },
                },
            };
        }
        if (operator === types_1.Operator.NOT_BETWEEN) {
            return {
                bool: {
                    must_not: {
                        range: {
                            [searchKey]: {
                                gte: value[0],
                                lte: value[1],
                            },
                        },
                    },
                },
            };
        }
        if (operator === types_1.Operator.REGEX) {
            return {
                regexp: {
                    [searchKey]: {
                        value,
                    },
                },
            };
        }
        if (operator === types_1.Operator.NOT_REGEX) {
            return {
                bool: {
                    must_not: {
                        regexp: {
                            [searchKey]: {
                                value,
                            },
                        },
                    },
                },
            };
        }
        if (operator === types_1.Operator.IN) {
            if (!Array.isArray(value)) {
                throw new Error('IN should be used with an array of values!');
            }
            return {
                terms: {
                    [searchKey]: value,
                },
            };
        }
        if (operator === types_1.Operator.NOT_IN) {
            if (!Array.isArray(value)) {
                throw new Error('notIn should be used with an array of values!');
            }
            const subQueries = value.map((v) => ({ match: { [searchKey]: v } }));
            return {
                bool: {
                    must_not: subQueries,
                },
            };
        }
        if (operator === types_1.Operator.CONTAINS) {
            if (!Array.isArray(value)) {
                return {
                    match_phrase: {
                        [searchKey]: value,
                    },
                };
            }
            const subQueries = value.map((v) => ({ match_phrase: { [searchKey]: v } }));
            return {
                bool: {
                    must: subQueries,
                },
            };
        }
        if (operator === types_1.Operator.OVERLAP) {
            if (!Array.isArray(value)) {
                throw new Error('Overlap should be used with an array of values!');
            }
            const subQueries = value.map((v) => ({ match_phrase: { [searchKey]: v } }));
            return {
                bool: {
                    should: subQueries,
                },
            };
        }
        if (operator === types_1.Operator.ARRAY_LENGTH) {
            if (typeof value !== 'object') {
                throw new Error('Array length should be used with an object containing operators and their values!');
            }
            const operatorsMapping = {
                gte: '>=',
                lte: '<=',
                gt: '>',
                lt: '<',
                eq: '==',
            };
            const scriptQueries = Object.entries(value).map(([lengthOperator, arrayLength]) => {
                if (typeof arrayLength !== 'number') {
                    throw new Error(`Array length value for operator ${lengthOperator} should be a number!`);
                }
                if (!Object.prototype.hasOwnProperty.call(operatorsMapping, lengthOperator)) {
                    throw new Error(`Invalid operator "${lengthOperator}" used in ARRAY_LENGTH`);
                }
                return {
                    script: {
                        source: `doc['${searchKey}'].length ${operatorsMapping[lengthOperator]} params.length`,
                        lang: 'painless',
                        params: {
                            length: arrayLength,
                        },
                    },
                };
            });
            return {
                bool: {
                    must: scriptQueries,
                },
            };
        }
        return {
            term: {
                [searchKey]: value,
            },
        };
    }
}
exports.OpensearchQueryParser = OpensearchQueryParser;
//# sourceMappingURL=opensearchQueryParser.js.map