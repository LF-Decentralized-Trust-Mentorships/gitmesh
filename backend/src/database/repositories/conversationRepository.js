"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const sequelize_1 = __importDefault(require("sequelize"));
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const integrations_1 = require("@gitmesh/integrations");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
const snakeCaseNames_1 = __importDefault(require("../../utils/snakeCaseNames"));
const queryParser_1 = __importDefault(require("./filters/queryParser"));
const segmentRepository_1 = __importDefault(require("./segmentRepository"));
const Op = sequelize_1.default.Op;
class ConversationRepository {
    static async create(data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(options);
        const record = await options.database.conversation.create(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['title', 'slug', 'published'])), { tenantId: tenant.id, segmentId: segment.id, createdById: currentUser.id, updatedById: currentUser.id }), {
            transaction,
        });
        await record.setActivities(data.activities || [], {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async update(id, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        let record = await options.database.conversation.findOne({
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
        record = await record.update(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['title', 'slug', 'published'])), { updatedById: currentUser.id }), {
            transaction,
        });
        if (data.activities) {
            await record.setActivities(data.activities, {
                transaction,
            });
        }
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async destroy(id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.conversation.findOne({
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
        });
        await this._createAuditLog(auditLogRepository_1.default.DELETE, record, record, options);
    }
    static async findById(id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.conversation.findOne({
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
    static async filterIdInTenant(id, options) {
        return lodash_1.default.get(await this.filterIdsInTenant([id], options), '[0]', null);
    }
    static async filterIdsInTenant(ids, options) {
        if (!ids || !ids.length) {
            return [];
        }
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const where = {
            id: {
                [Op.in]: ids,
            },
            tenantId: currentTenant.id,
        };
        const records = await options.database.conversation.findAll({
            attributes: ['id'],
            where,
        });
        return records.map((record) => record.id);
    }
    static async destroyBulk(ids, options, force = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        await options.database.conversation.destroy({
            where: {
                id: ids,
                tenantId: currentTenant.id,
                segmentId: sequelizeRepository_1.default.getSegmentIds(options),
            },
            force,
            transaction,
        });
    }
    static async count(filter, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        return options.database.conversation.count({
            where: Object.assign(Object.assign({}, filter), { tenantId: tenant.id, segmentId: sequelizeRepository_1.default.getSegmentIds(options) }),
            transaction,
        });
    }
    static async findAndCountAll({ filter = {}, advancedFilter = null, limit = 0, offset = 0, orderBy = '', lazyLoad = [], }, options) {
        let customOrderBy = [];
        const include = [
            {
                model: options.database.activity,
                as: 'activities',
                attributes: [],
            },
        ];
        // If the advanced filter is empty, we construct it from the query parameter filter
        if (!advancedFilter) {
            advancedFilter = { and: [] };
            // Filter by ID
            if (filter.id) {
                advancedFilter.and.push({ id: filter.id });
            }
            if (filter.published === true ||
                filter.published === 'true' ||
                filter.published === false ||
                filter.published === 'false') {
                advancedFilter.and.push({
                    published: filter.published === true || filter.published === 'true',
                });
            }
            // Filter by title
            if (filter.title) {
                advancedFilter.and.push({
                    title: {
                        textContains: filter.title,
                    },
                });
            }
            // Filter by slug
            if (filter.slug) {
                advancedFilter.and.push({
                    slug: {
                        like: filter.slug,
                    },
                });
            }
            // Filter by createdAtRange
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
                            lte: end,
                        },
                    });
                }
            }
            if (filter.platform) {
                advancedFilter.and.push({
                    platform: filter.platform,
                });
            }
            if (filter.channel) {
                advancedFilter.and.push({
                    channel: { like: filter.channel },
                });
            }
            if (filter.activityCountRange) {
                const [start, end] = filter.activityCountRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        activityCount: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        activityCount: {
                            lte: end,
                        },
                    });
                }
            }
            if (filter.lastActiveRange) {
                const [start, end] = filter.lastActiveRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        lastActive: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        lastActive: {
                            lte: end,
                        },
                    });
                }
            }
        }
        // generate customOrderBy array for ordering Sequelize literals
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('activityCount', orderBy));
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('lastActive', orderBy));
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('channel', orderBy));
        const activityCount = options.database.Sequelize.fn('COUNT', options.database.Sequelize.col('activities.id'));
        const lastActive = options.database.Sequelize.fn('MAX', options.database.Sequelize.col('activities.timestamp'));
        const platform = sequelize_1.default.col('activities.platform');
        const parser = new queryParser_1.default({
            aggregators: Object.assign(Object.assign({}, sequelizeFilterUtils_1.default.getNativeTableFieldAggregations([
                'id',
                'title',
                'slug',
                'published',
                'createdAt',
                'updatedAt',
                'tenantId',
                'segmentId',
                'createdById',
                'updatedById',
            ], 'conversation')), { activityCount, channel: sequelize_1.default.literal(`"activities"."channel"`), lastActive,
                platform }),
        }, options);
        const parsed = parser.parse({
            filter: advancedFilter,
            orderBy: orderBy || ['createdAt_DESC'],
            limit,
            offset,
        });
        let order = parsed.order;
        if (customOrderBy.length > 0) {
            order = [customOrderBy];
        }
        else if (orderBy) {
            order = [orderBy.split('_')];
        }
        // eslint-disable-next-line prefer-const
        let { rows, count } = await options.database.conversation.findAndCountAll(Object.assign(Object.assign(Object.assign({ attributes: [
                ...sequelizeFilterUtils_1.default.getLiteralProjections([
                    'id',
                    'title',
                    'slug',
                    'published',
                    'createdAt',
                    'tenantId',
                    'segmentId',
                    'updatedAt',
                    'createdById',
                    'updatedById',
                ], 'conversation'),
                [platform, 'platform'],
                [activityCount, 'activityCount'],
                [lastActive, 'lastActive'],
                [sequelize_1.default.literal(`MAX("activities"."channel")`), 'channel'],
            ] }, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { include,
            order, transaction: sequelizeRepository_1.default.getTransaction(options), group: ['conversation.id', 'activities.platform', 'activities.channel'], limit: parsed.limit, offset: parsed.offset, subQuery: false, distinct: true }));
        rows = await this._populateRelationsForRows(rows, options, lazyLoad);
        return { rows, count: count.length };
    }
    static async _createAuditLog(action, record, data, options) {
        let values = {};
        if (data) {
            values = Object.assign({}, record.get({ plain: true }));
        }
        await auditLogRepository_1.default.log({
            entityName: 'conversation',
            entityId: record.id,
            action,
            values,
        }, options);
    }
    /**
     * Counts distinct members in a conversation
     * @param activities Activity list in a conversation
     */
    static getTotalMemberCount(activities) {
        var _a;
        return ((_a = activities.reduce((acc, i) => {
            if (!acc.ids) {
                acc.ids = [];
                acc.count = 0;
            }
            if (!acc.ids[i.memberId]) {
                acc.ids[i.memberId] = true;
                acc.count += 1;
            }
            return acc;
        }, {}).count) !== null && _a !== void 0 ? _a : 0);
    }
    static async _populateRelationsForRows(rows, options, lazyLoad = []) {
        if (!rows) {
            return rows;
        }
        return Promise.all(rows.map(async (record) => {
            const rec = record.get({ plain: true });
            for (const relationship of lazyLoad) {
                if (relationship === 'activities') {
                    const allActivities = await record.getActivities({
                        order: [
                            ['timestamp', 'ASC'],
                            ['createdAt', 'ASC'],
                        ],
                        include: ['parent', 'organization'],
                    });
                    rec.memberCount = ConversationRepository.getTotalMemberCount(allActivities);
                    if (allActivities.length > 0) {
                        let neededActivities = [];
                        const parentActivity = allActivities.find((a) => a.parent === null) || allActivities[0];
                        if (parentActivity) {
                            neededActivities = [parentActivity];
                        }
                        if (allActivities.length > 2) {
                            neededActivities = [
                                ...neededActivities,
                                allActivities[allActivities.length - 2],
                                allActivities[allActivities.length - 1],
                            ];
                        }
                        else {
                            neededActivities = [...neededActivities, allActivities[allActivities.length - 1]];
                        }
                        const promises = neededActivities.map(async (act) => {
                            const member = (await act.getMember()).get({ plain: true });
                            let objectMember = null;
                            if (act.objectMemberId) {
                                objectMember = (await act.getObjectMember()).get({ plain: true });
                            }
                            act = act.get({ plain: true });
                            act.member = member;
                            act.objectMember = objectMember;
                            act.display = integrations_1.ActivityDisplayService.getDisplayOptions(act, segmentRepository_1.default.getActivityTypes(options));
                            return act;
                        });
                        const returnedNeededActivities = await Promise.all(promises);
                        rec.conversationStarter = returnedNeededActivities[0];
                        rec.lastReplies = returnedNeededActivities.slice(1);
                    }
                    else {
                        rec.conversationStarter = null;
                        rec.lastReplies = [];
                    }
                    if (rec.conversationStarter) {
                        rec.conversationStarter.display = integrations_1.ActivityDisplayService.getDisplayOptions(rec.conversationStarter, segmentRepository_1.default.getActivityTypes(options));
                    }
                }
                else {
                    rec[relationship] = (await record[`get${(0, snakeCaseNames_1.default)(relationship)}`]()).map((a) => a.get({ plain: true }));
                }
            }
            if (rec.activityCount) {
                rec.activityCount = parseInt(rec.activityCount, 10);
                if (rec.platform && rec.platform === types_1.PlatformType.GITHUB) {
                    rec.channel = this.extractGitHubRepoPath(rec.channel);
                }
            }
            return rec;
        }));
    }
    static extractGitHubRepoPath(url) {
        var _a, _b;
        if (!url)
            return null;
        const match = url.match(/^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/);
        if (!match || !(((_a = match.groups) === null || _a === void 0 ? void 0 : _a.owner) && ((_b = match.groups) === null || _b === void 0 ? void 0 : _b.name)))
            return null;
        return `${match.groups.owner}/${match.groups.name}`;
    }
    static async _populateRelations(record, options) {
        var _a, _b;
        if (!record) {
            return record;
        }
        const output = record.get({ plain: true });
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        // Fetch the first activity with parent = null
        const firstActivity = await record.getActivities({
            where: {
                parentId: null,
            },
            include: ['member', 'parent', 'objectMember', 'organization'],
            transaction,
            order: [
                ['timestamp', 'ASC'],
                ['createdAt', 'ASC'],
            ],
        });
        // Fetch remaining activities with parent != null
        const remainingActivities = await record.getActivities({
            where: {
                parentId: {
                    [sequelize_1.default.Op.not]: null,
                },
            },
            include: ['member', 'parent', 'objectMember', 'organization'],
            order: [
                ['timestamp', 'ASC'],
                ['createdAt', 'ASC'],
            ],
            transaction,
        });
        output.activities = [...firstActivity, ...remainingActivities];
        let memberPromises = output.activities.map(async (act) => {
            const member = (await act.getMember()).get({ plain: true });
            act = act.get({ plain: true });
            act.member = member;
            act.display = integrations_1.ActivityDisplayService.getDisplayOptions(act, segmentRepository_1.default.getActivityTypes(options));
            return act;
        });
        const chunkedPromises = [];
        const CHUNK_PROMISE_SIZE = 50;
        if (memberPromises.length > CHUNK_PROMISE_SIZE) {
            while (memberPromises.length > CHUNK_PROMISE_SIZE) {
                chunkedPromises.push(memberPromises.slice(0, CHUNK_PROMISE_SIZE));
                memberPromises = memberPromises.slice(CHUNK_PROMISE_SIZE);
            }
            if (memberPromises.length > 0) {
                chunkedPromises.push(memberPromises);
            }
        }
        else {
            chunkedPromises.push(memberPromises);
        }
        output.activities = [];
        for (const memberPromiseChunk of chunkedPromises) {
            output.activities.push(...(await Promise.all(memberPromiseChunk)));
        }
        output.memberCount = ConversationRepository.getTotalMemberCount(output.activities);
        output.conversationStarter = (_a = output.activities[0]) !== null && _a !== void 0 ? _a : null;
        output.activityCount = output.activities.length;
        output.platform = null;
        output.channel = null;
        output.lastActive = null;
        if (output.activityCount > 0) {
            output.platform = (_b = output.activities[0].platform) !== null && _b !== void 0 ? _b : null;
            output.lastActive = output.activities[output.activities.length - 1].timestamp;
            output.channel = output.activities[0].channel ? output.activities[0].channel : null;
            output.conversationStarter.display = integrations_1.ActivityDisplayService.getDisplayOptions(output.conversationStarter, segmentRepository_1.default.getActivityTypes(options));
        }
        return output;
    }
}
exports.default = ConversationRepository;
//# sourceMappingURL=conversationRepository.js.map