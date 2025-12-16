"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var sanitize_html_1 = __importDefault(require("sanitize-html"));
var lodash_1 = __importDefault(require("lodash"));
var sequelize_1 = __importDefault(require("sequelize"));
var integrations_1 = require("@gitmesh/integrations");
var common_1 = require("@gitmesh/common");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
var queryParser_1 = __importDefault(require("./filters/queryParser"));
var memberRepository_1 = __importDefault(require("./memberRepository"));
var segmentRepository_1 = __importDefault(require("./segmentRepository"));
var Op = sequelize_1["default"].Op;
var log = false;
var ActivityRepository = /** @class */ (function () {
    function ActivityRepository() {
    }
    ActivityRepository.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, tenant, transaction, segment, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        segment = sequelizeRepository_1["default"].getStrictlySingleActiveSegment(options);
                        // Data and body will be displayed as HTML. We need to sanitize them.
                        if (data.body) {
                            data.body = (0, sanitize_html_1["default"])(data.body).trim();
                        }
                        if (data.title) {
                            data.title = (0, sanitize_html_1["default"])(data.title).trim();
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
                        return [4 /*yield*/, options.database.activity.create(__assign(__assign({}, lodash_1["default"].pick(data, [
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
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        return [4 /*yield*/, record.setTasks(data.tasks || [], {
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].CREATE, record, data, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    /**
     * Check whether sentiment data is valid
     * @param sentimentData Object: {positive: number, negative: number, mixed: number, neutral: number, sentiment: 'positive' | 'negative' | 'mixed' | 'neutral'}
     */
    ActivityRepository._validateSentiment = function (sentimentData) {
        if (!lodash_1["default"].isEmpty(sentimentData)) {
            var moods = ['positive', 'negative', 'mixed', 'neutral'];
            for (var _i = 0, moods_1 = moods; _i < moods_1.length; _i++) {
                var prop = moods_1[_i];
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
    };
    ActivityRepository.update = function (id, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, currentTenant, segment, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segment = sequelizeRepository_1["default"].getStrictlySingleActiveSegment(options);
                        return [4 /*yield*/, options.database.activity.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id,
                                    segmentId: segment.id
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        return [4 /*yield*/, record.setTasks(data.tasks || [], {
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        // Data and body will be displayed as HTML. We need to sanitize them.
                        if (data.body) {
                            data.body = (0, sanitize_html_1["default"])(data.body).trim();
                        }
                        if (data.title) {
                            data.title = (0, sanitize_html_1["default"])(data.title).trim();
                        }
                        if (data.sentiment) {
                            this._validateSentiment(data.sentiment);
                        }
                        return [4 /*yield*/, record.update(__assign(__assign({}, lodash_1["default"].pick(data, [
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
                                transaction: transaction
                            })];
                    case 3:
                        record = _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].UPDATE, record, data, options)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    ActivityRepository.destroy = function (id, options, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.activity.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id,
                                    segmentId: sequelizeRepository_1["default"].getSegmentIds(options)
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, record.destroy({
                                transaction: transaction,
                                force: force
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].DELETE, record, record, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ActivityRepository.findById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [
                            {
                                model: options.database.member,
                                as: 'member'
                            },
                            {
                                model: options.database.member,
                                as: 'objectMember'
                            },
                            {
                                model: options.database.activity,
                                as: 'parent'
                            },
                            {
                                model: options.database.organization,
                                as: 'organization'
                            },
                        ];
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.activity.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id,
                                    segmentId: sequelizeRepository_1["default"].getSegmentIds(options)
                                },
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [2 /*return*/, this._populateRelations(record, options)];
                }
            });
        });
    };
    /**
     * Find a record in the database given a query.
     * @param query Query to find by
     * @param options Repository options
     * @returns The found record. Null if none is found.
     */
    ActivityRepository.findOne = function (query, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.activity.findOne({
                                where: __assign({ tenantId: currentTenant.id, segmentId: sequelizeRepository_1["default"].getSegmentIds(options) }, query),
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        return [2 /*return*/, this._populateRelations(record, options)];
                }
            });
        });
    };
    ActivityRepository.filterIdInTenant = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = lodash_1["default"]).get;
                        return [4 /*yield*/, this.filterIdsInTenant([id], options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), '[0]', null])];
                }
            });
        });
    };
    ActivityRepository.filterIdsInTenant = function (ids, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTenant, transaction, where, records;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ids || !ids.length) {
                            return [2 /*return*/, []];
                        }
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        where = {
                            id: (_a = {},
                                _a[Op["in"]] = ids,
                                _a),
                            tenantId: currentTenant.id
                        };
                        return [4 /*yield*/, options.database.activity.findAll({
                                attributes: ['id'],
                                where: where,
                                transaction: transaction
                            })];
                    case 1:
                        records = _b.sent();
                        return [2 /*return*/, records.map(function (record) { return record.id; })];
                }
            });
        });
    };
    ActivityRepository.count = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, tenant;
            return __generator(this, function (_a) {
                transaction = sequelizeRepository_1["default"].getTransaction(options);
                tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                return [2 /*return*/, options.database.activity.count({
                        where: __assign(__assign({}, filter), { tenantId: tenant.id, segmentId: sequelizeRepository_1["default"].getSegmentIds(options) }),
                        transaction: transaction
                    })];
            });
        });
    };
    ActivityRepository.findAndCountAll = function (_a, options) {
        var _b;
        var _c = _a.filter, filter = _c === void 0 ? {} : _c, _d = _a.advancedFilter, advancedFilter = _d === void 0 ? null : _d, _e = _a.limit, limit = _e === void 0 ? 0 : _e, _f = _a.offset, offset = _f === void 0 ? 0 : _f, _g = _a.orderBy, orderBy = _g === void 0 ? '' : _g, _h = _a.attributesSettings, attributesSettings = _h === void 0 ? [] : _h;
        return __awaiter(this, void 0, void 0, function () {
            var _j, start, end, _k, start, end, _l, start, end, _i, _m, mood, _o, start, end, _p, start, end, memberSequelizeInclude, _q, dynamicAttributesDefaultNestedFields, dynamicAttributesPlatformNestedFields, memberQueryParser, parsedMemberQuery, include, parser, parsed, _r, rows, count;
            var _s, _t;
            return __generator(this, function (_u) {
                switch (_u.label) {
                    case 0:
                        // If the advanced filter is empty, we construct it from the query parameter filter
                        if (!advancedFilter) {
                            advancedFilter = { and: [] };
                            if (filter.id) {
                                advancedFilter.and.push({
                                    id: filter.id
                                });
                            }
                            if (filter.type) {
                                advancedFilter.and.push({
                                    type: {
                                        textContains: filter.type
                                    }
                                });
                            }
                            if (filter.timestampRange) {
                                _j = filter.timestampRange, start = _j[0], end = _j[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    advancedFilter.and.push({
                                        timestamp: {
                                            gte: start
                                        }
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    advancedFilter.and.push({
                                        timestamp: {
                                            lte: end
                                        }
                                    });
                                }
                            }
                            if (filter.platform) {
                                advancedFilter.and.push({
                                    platform: {
                                        textContains: filter.platform
                                    }
                                });
                            }
                            if (filter.member) {
                                advancedFilter.and.push({
                                    memberId: filter.member
                                });
                            }
                            if (filter.objectMember) {
                                advancedFilter.and.push({
                                    objectMemberId: filter.objectMember
                                });
                            }
                            if (filter.isContribution === true ||
                                filter.isContribution === 'true' ||
                                filter.isContribution === false ||
                                filter.isContribution === 'false') {
                                advancedFilter.and.push({
                                    isContribution: filter.isContribution === true || filter.isContribution === 'true'
                                });
                            }
                            if (filter.scoreRange) {
                                _k = filter.scoreRange, start = _k[0], end = _k[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    advancedFilter.and.push({
                                        score: {
                                            gte: start
                                        }
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    advancedFilter.and.push({
                                        score: {
                                            lte: end
                                        }
                                    });
                                }
                            }
                            if (filter.channel) {
                                advancedFilter.and.push({
                                    channel: {
                                        textContains: filter.channel
                                    }
                                });
                            }
                            if (filter.body) {
                                advancedFilter.and.push({
                                    body: {
                                        textContains: filter.body
                                    }
                                });
                            }
                            if (filter.title) {
                                advancedFilter.and.push({
                                    title: {
                                        textContains: filter.title
                                    }
                                });
                            }
                            if (filter.url) {
                                advancedFilter.and.push({
                                    textContains: filter.channel
                                });
                            }
                            if (filter.sentimentRange) {
                                _l = filter.sentimentRange, start = _l[0], end = _l[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    advancedFilter.and.push({
                                        sentiment: {
                                            gte: start
                                        }
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    advancedFilter.and.push({
                                        sentiment: {
                                            lte: end
                                        }
                                    });
                                }
                            }
                            if (filter.sentimentLabel) {
                                advancedFilter.and.push({
                                    'sentiment.label': filter.sentimentLabel
                                });
                            }
                            for (_i = 0, _m = ['positive', 'negative', 'neutral', 'mixed']; _i < _m.length; _i++) {
                                mood = _m[_i];
                                if (filter["".concat(mood, "SentimentRange")]) {
                                    _o = filter["".concat(mood, "SentimentRange")], start = _o[0], end = _o[1];
                                    if (start !== undefined && start !== null && start !== '') {
                                        advancedFilter.and.push((_s = {},
                                            _s["sentiment.".concat(mood)] = {
                                                gte: start
                                            },
                                            _s));
                                    }
                                    if (end !== undefined && end !== null && end !== '') {
                                        advancedFilter.and.push((_t = {},
                                            _t["sentiment.".concat(mood)] = {
                                                lte: end
                                            },
                                            _t));
                                    }
                                }
                            }
                            if (filter.parent) {
                                advancedFilter.and.push({
                                    parentId: filter.parent
                                });
                            }
                            if (filter.sourceParentId) {
                                advancedFilter.and.push({
                                    sourceParentId: filter.sourceParentId
                                });
                            }
                            if (filter.sourceId) {
                                advancedFilter.and.push({
                                    sourceId: filter.sourceId
                                });
                            }
                            if (filter.conversationId) {
                                advancedFilter.and.push({
                                    conversationId: filter.conversationId
                                });
                            }
                            if (filter.organizations) {
                                advancedFilter.and.push({
                                    organizationId: filter.organizations
                                });
                            }
                            if (filter.createdAtRange) {
                                _p = filter.createdAtRange, start = _p[0], end = _p[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    advancedFilter.and.push({
                                        createdAt: {
                                            gte: start
                                        }
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    advancedFilter.and.push({
                                        createdAt: {
                                            gte: end
                                        }
                                    });
                                }
                            }
                        }
                        memberSequelizeInclude = {
                            model: options.database.member,
                            as: 'member',
                            where: {}
                        };
                        if (!advancedFilter.member) return [3 /*break*/, 2];
                        return [4 /*yield*/, memberRepository_1["default"].getDynamicAttributesLiterals(attributesSettings, options)];
                    case 1:
                        _q = _u.sent(), dynamicAttributesDefaultNestedFields = _q.dynamicAttributesDefaultNestedFields, dynamicAttributesPlatformNestedFields = _q.dynamicAttributesPlatformNestedFields;
                        memberQueryParser = new queryParser_1["default"]({
                            nestedFields: __assign(__assign(__assign({}, dynamicAttributesDefaultNestedFields), dynamicAttributesPlatformNestedFields), { reach: 'reach.total' }),
                            manyToMany: {
                                tags: {
                                    table: 'members',
                                    model: 'member',
                                    relationTable: {
                                        name: 'memberTags',
                                        from: 'memberId',
                                        to: 'tagId'
                                    }
                                },
                                segments: {
                                    table: 'members',
                                    model: 'member',
                                    relationTable: {
                                        name: 'memberSegments',
                                        from: 'memberId',
                                        to: 'segmentId'
                                    }
                                },
                                organizations: {
                                    table: 'members',
                                    model: 'member',
                                    relationTable: {
                                        name: 'memberOrganizations',
                                        from: 'memberId',
                                        to: 'organizationId'
                                    }
                                }
                            },
                            customOperators: {
                                username: {
                                    model: 'member',
                                    column: 'username'
                                },
                                platform: {
                                    model: 'member',
                                    column: 'username'
                                }
                            }
                        }, options);
                        parsedMemberQuery = memberQueryParser.parse({
                            filter: advancedFilter.member,
                            orderBy: orderBy || ['joinedAt_DESC'],
                            limit: limit,
                            offset: offset
                        });
                        memberSequelizeInclude.where = (_b = parsedMemberQuery.where) !== null && _b !== void 0 ? _b : {};
                        delete advancedFilter.member;
                        _u.label = 2;
                    case 2:
                        if (advancedFilter.organizations) {
                            advancedFilter.organizationId = advancedFilter.organizations;
                            delete advancedFilter.organizations;
                        }
                        include = [
                            memberSequelizeInclude,
                            {
                                model: options.database.activity,
                                as: 'parent',
                                include: [
                                    {
                                        model: options.database.member,
                                        as: 'member'
                                    },
                                ]
                            },
                            {
                                model: options.database.member,
                                as: 'objectMember'
                            },
                            {
                                model: options.database.organization,
                                as: 'organization'
                            },
                        ];
                        parser = new queryParser_1["default"]({
                            nestedFields: {
                                sentiment: 'sentiment.sentiment'
                            },
                            manyToMany: {
                                organizations: {
                                    table: 'activities',
                                    model: 'activity',
                                    overrideJoinField: 'memberId',
                                    relationTable: {
                                        name: 'memberOrganizations',
                                        from: 'memberId',
                                        to: 'organizationId'
                                    }
                                }
                            }
                        }, options);
                        parsed = parser.parse({
                            filter: advancedFilter,
                            orderBy: orderBy || ['timestamp_DESC'],
                            limit: limit,
                            offset: offset
                        });
                        return [4 /*yield*/, options.database.activity.findAndCountAll(__assign(__assign(__assign({ include: include, attributes: __spreadArray([], sequelizeFilterUtils_1["default"].getLiteralProjectionsOfModel('activity', options.database), true) }, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { order: parsed.order, limit: parsed.limit, offset: parsed.offset, transaction: sequelizeRepository_1["default"].getTransaction(options) }))];
                    case 3:
                        _r = _u.sent(), rows = _r.rows, count = _r.count;
                        return [4 /*yield*/, this._populateRelationsForRows(rows, options)];
                    case 4:
                        rows = _u.sent();
                        return [2 /*return*/, { rows: rows, count: count, limit: parsed.limit, offset: parsed.offset }];
                }
            });
        });
    };
    ActivityRepository.findAllAutocomplete = function (query, limit, options) {
        return __awaiter(this, void 0, void 0, function () {
            var tenant, whereAnd, where, records;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        whereAnd = [
                            {
                                tenantId: tenant.id
                            },
                        ];
                        if (query) {
                            whereAnd.push((_a = {},
                                _a[Op.or] = [{ id: sequelizeFilterUtils_1["default"].uuid(query) }],
                                _a));
                        }
                        where = (_b = {}, _b[Op.and] = whereAnd, _b);
                        return [4 /*yield*/, options.database.activity.findAll({
                                attributes: ['id', 'id'],
                                where: where,
                                limit: limit ? Number(limit) : undefined,
                                order: [['id', 'ASC']]
                            })];
                    case 1:
                        records = _c.sent();
                        return [2 /*return*/, records.map(function (record) { return ({
                                id: record.id,
                                label: record.id
                            }); })];
                }
            });
        });
    };
    ActivityRepository._createAuditLog = function (action, record, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!log) return [3 /*break*/, 2];
                        values = {};
                        if (data) {
                            values = __assign({}, record.get({ plain: true }));
                        }
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'activity',
                                entityId: record.id,
                                action: action,
                                values: values
                            }, options)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ActivityRepository._populateRelationsForRows = function (rows, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!rows) {
                    return [2 /*return*/, rows];
                }
                return [2 /*return*/, Promise.all(rows.map(function (record) { return _this._populateRelations(record, options); }))];
            });
        });
    };
    ActivityRepository._populateRelations = function (record, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, output, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!record) {
                            return [2 /*return*/, record];
                        }
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        output = record.get({ plain: true });
                        output.display = integrations_1.ActivityDisplayService.getDisplayOptions(record, segmentRepository_1["default"].getActivityTypes(options));
                        if (output.parent) {
                            output.parent.display = integrations_1.ActivityDisplayService.getDisplayOptions(output.parent, segmentRepository_1["default"].getActivityTypes(options));
                        }
                        _a = output;
                        return [4 /*yield*/, record.getTasks({
                                transaction: transaction,
                                joinTableAttributes: []
                            })];
                    case 1:
                        _a.tasks = _b.sent();
                        return [2 /*return*/, output];
                }
            });
        });
    };
    return ActivityRepository;
}());
exports["default"] = ActivityRepository;
