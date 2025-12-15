"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const lodash_1 = __importDefault(require("lodash"));
const sequelize_1 = __importDefault(require("sequelize"));
const integrations_1 = require("@gitmesh/integrations");
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
const queryParser_1 = __importDefault(require("./filters/queryParser"));
const memberRepository_1 = __importDefault(require("./memberRepository"));
const segmentRepository_1 = __importDefault(require("./segmentRepository"));
const { Op } = sequelize_1.default;
const log = false;
class ActivityRepository {
    static async create(data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(options);
        // Data and body will be displayed as HTML. We need to sanitize them.
        if (data.body) {
            data.body = (0, sanitize_html_1.default)(data.body).trim();
        }
        if (data.title) {
            data.title = (0, sanitize_html_1.default)(data.title).trim();
        }
        if (data.sentiment) {
            this._validateSentiment(data.sentiment);
        }
        // type and platform to lowercase
        if (data.type) {
            data.type = data.type.toLowerCase();
        }
        if (data.platform) {
            data.platform = data.platform.toLowerCase();
        }
        const record = await options.database.activity.create(Object.assign(Object.assign({}, lodash_1.default.pick(data, [
            'type',
            'timestamp',
            'platform',
            'isContribution',
            'score',
            'attributes',
            'channel',
            'body',
            'title',
            'url',
            'sentiment',
            'sourceId',
            'importHash',
            'username',
            'objectMemberUsername',
        ])), { memberId: data.member || null, objectMemberId: data.objectMember || undefined, organizationId: data.organizationId || undefined, parentId: data.parent || null, sourceParentId: data.sourceParentId || null, conversationId: data.conversationId || null, segmentId: segment.id, tenantId: tenant.id, createdById: currentUser.id, updatedById: currentUser.id }), {
            transaction,
        });
        await record.setTasks(data.tasks || [], {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options);
    }
    /**
     * Check whether sentiment data is valid
     * @param sentimentData Object: {positive: number, negative: number, mixed: number, neutral: number, sentiment: 'positive' | 'negative' | 'mixed' | 'neutral'}
     */
    static _validateSentiment(sentimentData) {
        if (!lodash_1.default.isEmpty(sentimentData)) {
            const moods = ['positive', 'negative', 'mixed', 'neutral'];
            for (const prop of moods) {
                if (typeof sentimentData[prop] !== 'number') {
                    throw new common_1.Error400('en', 'activity.error.sentiment.mood');
                }
            }
            if (!moods.includes(sentimentData.label)) {
                throw new common_1.Error400('en', 'activity.error.sentiment.label');
            }
            if (typeof sentimentData.sentiment !== 'number') {
                throw new Error('activity.error.sentiment.sentiment');
            }
        }
    }
    static async update(id, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(options);
        let record = await options.database.activity.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
                segmentId: segment.id,
            },
            transaction,
        });
        await record.setTasks(data.tasks || [], {
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        // Data and body will be displayed as HTML. We need to sanitize them.
        if (data.body) {
            data.body = (0, sanitize_html_1.default)(data.body).trim();
        }
        if (data.title) {
            data.title = (0, sanitize_html_1.default)(data.title).trim();
        }
        if (data.sentiment) {
            this._validateSentiment(data.sentiment);
        }
        record = await record.update(Object.assign(Object.assign({}, lodash_1.default.pick(data, [
            'type',
            'timestamp',
            'platform',
            'isContribution',
            'attributes',
            'channel',
            'body',
            'title',
            'url',
            'sentiment',
            'score',
            'sourceId',
            'importHash',
            'username',
            'objectMemberUsername',
        ])), { memberId: data.member || undefined, objectMemberId: data.objectMember || undefined, organizationId: data.organizationId, parentId: data.parent || undefined, sourceParentId: data.sourceParentId || undefined, conversationId: data.conversationId || undefined, updatedById: currentUser.id }), {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async destroy(id, options, force = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.activity.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
                segmentId: sequelizeRepository_1.default.getSegmentIds(options),
            },
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        await record.destroy({
            transaction,
            force,
        });
        await this._createAuditLog(auditLogRepository_1.default.DELETE, record, record, options);
    }
    static async findById(id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [
            {
                model: options.database.member,
                as: 'member',
            },
            {
                model: options.database.member,
                as: 'objectMember',
            },
            {
                model: options.database.activity,
                as: 'parent',
            },
            {
                model: options.database.organization,
                as: 'organization',
            },
        ];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.activity.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
                segmentId: sequelizeRepository_1.default.getSegmentIds(options),
            },
            include,
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        return this._populateRelations(record, options);
    }
    /**
     * Find a record in the database given a query.
     * @param query Query to find by
     * @param options Repository options
     * @returns The found record. Null if none is found.
     */
    static async findOne(query, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.activity.findOne({
            where: Object.assign({ tenantId: currentTenant.id, segmentId: sequelizeRepository_1.default.getSegmentIds(options) }, query),
            transaction,
        });
        return this._populateRelations(record, options);
    }
    static async filterIdInTenant(id, options) {
        return lodash_1.default.get(await this.filterIdsInTenant([id], options), '[0]', null);
    }
    static async filterIdsInTenant(ids, options) {
        if (!ids || !ids.length) {
            return [];
        }
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const where = {
            id: {
                [Op.in]: ids,
            },
            tenantId: currentTenant.id,
        };
        const records = await options.database.activity.findAll({
            attributes: ['id'],
            where,
            transaction,
        });
        return records.map((record) => record.id);
    }
    static async count(filter, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        return options.database.activity.count({
            where: Object.assign(Object.assign({}, filter), { tenantId: tenant.id, segmentId: sequelizeRepository_1.default.getSegmentIds(options) }),
            transaction,
        });
    }
    static async findAndCountAll({ filter = {}, advancedFilter = null, limit = 0, offset = 0, orderBy = '', attributesSettings = [], }, options) {
        var _a;
        // If the advanced filter is empty, we construct it from the query parameter filter
        if (!advancedFilter) {
            advancedFilter = { and: [] };
            if (filter.id) {
                advancedFilter.and.push({
                    id: filter.id,
                });
            }
            if (filter.type) {
                advancedFilter.and.push({
                    type: {
                        textContains: filter.type,
                    },
                });
            }
            if (filter.timestampRange) {
                const [start, end] = filter.timestampRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        timestamp: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        timestamp: {
                            lte: end,
                        },
                    });
                }
            }
            if (filter.platform) {
                advancedFilter.and.push({
                    platform: {
                        textContains: filter.platform,
                    },
                });
            }
            if (filter.member) {
                advancedFilter.and.push({
                    memberId: filter.member,
                });
            }
            if (filter.objectMember) {
                advancedFilter.and.push({
                    objectMemberId: filter.objectMember,
                });
            }
            if (filter.isContribution === true ||
                filter.isContribution === 'true' ||
                filter.isContribution === false ||
                filter.isContribution === 'false') {
                advancedFilter.and.push({
                    isContribution: filter.isContribution === true || filter.isContribution === 'true',
                });
            }
            if (filter.scoreRange) {
                const [start, end] = filter.scoreRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        score: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        score: {
                            lte: end,
                        },
                    });
                }
            }
            if (filter.channel) {
                advancedFilter.and.push({
                    channel: {
                        textContains: filter.channel,
                    },
                });
            }
            if (filter.body) {
                advancedFilter.and.push({
                    body: {
                        textContains: filter.body,
                    },
                });
            }
            if (filter.title) {
                advancedFilter.and.push({
                    title: {
                        textContains: filter.title,
                    },
                });
            }
            if (filter.url) {
                advancedFilter.and.push({
                    textContains: filter.channel,
                });
            }
            if (filter.sentimentRange) {
                const [start, end] = filter.sentimentRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        sentiment: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        sentiment: {
                            lte: end,
                        },
                    });
                }
            }
            if (filter.sentimentLabel) {
                advancedFilter.and.push({
                    'sentiment.label': filter.sentimentLabel,
                });
            }
            for (const mood of ['positive', 'negative', 'neutral', 'mixed']) {
                if (filter[`${mood}SentimentRange`]) {
                    const [start, end] = filter[`${mood}SentimentRange`];
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            [`sentiment.${mood}`]: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            [`sentiment.${mood}`]: {
                                lte: end,
                            },
                        });
                    }
                }
            }
            if (filter.parent) {
                advancedFilter.and.push({
                    parentId: filter.parent,
                });
            }
            if (filter.sourceParentId) {
                advancedFilter.and.push({
                    sourceParentId: filter.sourceParentId,
                });
            }
            if (filter.sourceId) {
                advancedFilter.and.push({
                    sourceId: filter.sourceId,
                });
            }
            if (filter.conversationId) {
                advancedFilter.and.push({
                    conversationId: filter.conversationId,
                });
            }
            if (filter.organizations) {
                advancedFilter.and.push({
                    organizationId: filter.organizations,
                });
            }
            if (filter.createdAtRange) {
                const [start, end] = filter.createdAtRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        createdAt: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        createdAt: {
                            gte: end,
                        },
                    });
                }
            }
        }
        const memberSequelizeInclude = {
            model: options.database.member,
            as: 'member',
            where: {},
        };
        if (advancedFilter.member) {
            const { dynamicAttributesDefaultNestedFields, dynamicAttributesPlatformNestedFields } = await memberRepository_1.default.getDynamicAttributesLiterals(attributesSettings, options);
            const memberQueryParser = new queryParser_1.default({
                nestedFields: Object.assign(Object.assign(Object.assign({}, dynamicAttributesDefaultNestedFields), dynamicAttributesPlatformNestedFields), { reach: 'reach.total' }),
                manyToMany: {
                    tags: {
                        table: 'members',
                        model: 'member',
                        relationTable: {
                            name: 'memberTags',
                            from: 'memberId',
                            to: 'tagId',
                        },
                    },
                    segments: {
                        table: 'members',
                        model: 'member',
                        relationTable: {
                            name: 'memberSegments',
                            from: 'memberId',
                            to: 'segmentId',
                        },
                    },
                    organizations: {
                        table: 'members',
                        model: 'member',
                        relationTable: {
                            name: 'memberOrganizations',
                            from: 'memberId',
                            to: 'organizationId',
                        },
                    },
                },
                customOperators: {
                    username: {
                        model: 'member',
                        column: 'username',
                    },
                    platform: {
                        model: 'member',
                        column: 'username',
                    },
                },
            }, options);
            const parsedMemberQuery = memberQueryParser.parse({
                filter: advancedFilter.member,
                orderBy: orderBy || ['joinedAt_DESC'],
                limit,
                offset,
            });
            memberSequelizeInclude.where = (_a = parsedMemberQuery.where) !== null && _a !== void 0 ? _a : {};
            delete advancedFilter.member;
        }
        if (advancedFilter.organizations) {
            advancedFilter.organizationId = advancedFilter.organizations;
            delete advancedFilter.organizations;
        }
        const include = [
            memberSequelizeInclude,
            {
                model: options.database.activity,
                as: 'parent',
                include: [
                    {
                        model: options.database.member,
                        as: 'member',
                    },
                ],
            },
            {
                model: options.database.member,
                as: 'objectMember',
            },
            {
                model: options.database.organization,
                as: 'organization',
            },
        ];
        const parser = new queryParser_1.default({
            nestedFields: {
                sentiment: 'sentiment.sentiment',
            },
            manyToMany: {
                organizations: {
                    table: 'activities',
                    model: 'activity',
                    overrideJoinField: 'memberId',
                    relationTable: {
                        name: 'memberOrganizations',
                        from: 'memberId',
                        to: 'organizationId',
                    },
                },
            },
        }, options);
        const parsed = parser.parse({
            filter: advancedFilter,
            orderBy: orderBy || ['timestamp_DESC'],
            limit,
            offset,
        });
        let { rows, count, // eslint-disable-line prefer-const
         } = await options.database.activity.findAndCountAll(Object.assign(Object.assign(Object.assign({ include, attributes: [
                ...sequelizeFilterUtils_1.default.getLiteralProjectionsOfModel('activity', options.database),
            ] }, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { order: parsed.order, limit: parsed.limit, offset: parsed.offset, transaction: sequelizeRepository_1.default.getTransaction(options) }));
        rows = await this._populateRelationsForRows(rows, options);
        return { rows, count, limit: parsed.limit, offset: parsed.offset };
    }
    static async findAllAutocomplete(query, limit, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const whereAnd = [
            {
                tenantId: tenant.id,
            },
        ];
        if (query) {
            whereAnd.push({
                [Op.or]: [{ id: sequelizeFilterUtils_1.default.uuid(query) }],
            });
        }
        const where = { [Op.and]: whereAnd };
        const records = await options.database.activity.findAll({
            attributes: ['id', 'id'],
            where,
            limit: limit ? Number(limit) : undefined,
            order: [['id', 'ASC']],
        });
        return records.map((record) => ({
            id: record.id,
            label: record.id,
        }));
    }
    static async _createAuditLog(action, record, data, options) {
        if (log) {
            let values = {};
            if (data) {
                values = Object.assign({}, record.get({ plain: true }));
            }
            await auditLogRepository_1.default.log({
                entityName: 'activity',
                entityId: record.id,
                action,
                values,
            }, options);
        }
    }
    static async _populateRelationsForRows(rows, options) {
        if (!rows) {
            return rows;
        }
        return Promise.all(rows.map((record) => this._populateRelations(record, options)));
    }
    static async _populateRelations(record, options) {
        if (!record) {
            return record;
        }
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const output = record.get({ plain: true });
        output.display = integrations_1.ActivityDisplayService.getDisplayOptions(record, segmentRepository_1.default.getActivityTypes(options));
        if (output.parent) {
            output.parent.display = integrations_1.ActivityDisplayService.getDisplayOptions(output.parent, segmentRepository_1.default.getActivityTypes(options));
        }
        output.tasks = await record.getTasks({
            transaction,
            joinTableAttributes: [],
        });
        return output;
    }
}
exports.default = ActivityRepository;
//# sourceMappingURL=activityRepository.js.map