"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const segmentRepository_1 = __importDefault(require("../database/repositories/segmentRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const default_report_json_1 = __importDefault(require("../jsons/default-report.json"));
const reportRepository_1 = __importDefault(require("../database/repositories/reportRepository"));
class SegmentService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    async update(id, data) {
        const segment = await this.findById(id);
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const segmentRepository = new segmentRepository_1.default(Object.assign(Object.assign({}, this.options), { transaction }));
            // do the update
            await segmentRepository.update(id, data);
            // update relation fields of parent objects
            if (!segmentRepository_1.default.isSubproject(segment) && (data.name || data.slug)) {
                await segmentRepository.updateChildrenBulk(segment, { name: data.name, slug: data.slug });
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return await this.findById(id);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async createProjectGroup(data) {
        // project groups shouldn't have parentSlug or grandparentSlug
        if (data.parentSlug || data.grandparentSlug) {
            throw new Error(`Project groups can't have parent or grandparent segments.`);
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const segmentRepository = new segmentRepository_1.default(Object.assign(Object.assign({}, this.options), { transaction }));
            // create project group
            const projectGroup = await segmentRepository.create(data);
            // create project counterpart
            await segmentRepository.create(Object.assign(Object.assign({}, data), { parentSlug: data.slug, parentName: data.name }));
            // create subproject counterpart
            await segmentRepository.create(Object.assign(Object.assign({}, data), { parentSlug: data.slug, grandparentSlug: data.slug, parentName: data.name, grandparentName: data.name }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return await this.findById(projectGroup.id);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async createProject(data) {
        // project groups shouldn't have parentSlug or grandparentSlug
        if (data.grandparentSlug) {
            throw new Error(`Projects can't have grandparent segments.`);
        }
        if (!data.parentSlug) {
            throw new Error('Missing parentSlug. Projects must belong to a project group.');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const segmentRepository = new segmentRepository_1.default(Object.assign(Object.assign({}, this.options), { transaction }));
        const parent = await segmentRepository.findBySlug(data.parentSlug, types_1.SegmentLevel.PROJECT_GROUP);
        if (parent === null) {
            throw new Error(`Project group ${data.parentName} does not exist.`);
        }
        try {
            // create project
            const project = await segmentRepository.create(data);
            // create subproject counterpart
            await segmentRepository.create(Object.assign(Object.assign({}, data), { parentSlug: data.slug, grandparentSlug: data.parentSlug, name: data.name, parentName: data.name, grandparentName: parent.name }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return await this.findById(project.id);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async createSubproject(data) {
        if (!data.parentSlug) {
            throw new Error('Missing parentSlug. Subprojects must belong to a project.');
        }
        if (!data.grandparentSlug) {
            throw new Error('Missing grandparentSlug. Subprojects must belong to a project group.');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const segmentRepository = new segmentRepository_1.default(Object.assign(Object.assign({}, this.options), { transaction }));
            const parent = await segmentRepository.findBySlug(data.parentSlug, types_1.SegmentLevel.PROJECT);
            if (parent === null) {
                throw new Error(`Project ${data.parentSlug} does not exist.`);
            }
            const grandparent = await segmentRepository.findBySlug(data.grandparentSlug, types_1.SegmentLevel.PROJECT_GROUP);
            if (grandparent === null) {
                throw new Error(`Project group ${data.parentSlug} does not exist.`);
            }
            const subproject = await segmentRepository.create(data);
            // create default report for the tenant
            await reportRepository_1.default.create({
                name: default_report_json_1.default.name,
                public: default_report_json_1.default.public,
            }, Object.assign(Object.assign({}, this.options), { transaction, currentSegments: [subproject] }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return subproject;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id) {
        return new segmentRepository_1.default(this.options).findById(id);
    }
    async queryProjectGroups(search) {
        const result = await new segmentRepository_1.default(this.options).queryProjectGroups(search);
        await this.addMemberCounts(result.rows, types_1.SegmentLevel.PROJECT_GROUP);
        return result;
    }
    async queryProjects(search) {
        const result = await new segmentRepository_1.default(this.options).queryProjects(search);
        await this.addMemberCounts(result.rows, types_1.SegmentLevel.PROJECT);
        return result;
    }
    async querySubprojects(search) {
        const result = await new segmentRepository_1.default(this.options).querySubprojects(search);
        await this.addMemberCounts(result.rows, types_1.SegmentLevel.SUB_PROJECT);
        return result;
    }
    async createActivityType(data, platform = types_1.PlatformType.OTHER) {
        if (!data.type) {
            throw new common_1.Error400(this.options.language, 'settings.activityTypes.errors.typeRequiredWhenCreating');
        }
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(this.options);
        const typeKey = data.type.toLowerCase();
        const platformKey = platform.toLowerCase();
        const activityTypes = segmentRepository_1.default.getActivityTypes(this.options);
        if (!activityTypes.custom[platformKey]) {
            activityTypes.custom[platformKey] = {};
        }
        // check key already exists
        if (activityTypes.custom && activityTypes.custom[platformKey][typeKey]) {
            return activityTypes;
        }
        activityTypes.custom[platformKey][typeKey] = {
            display: {
                default: data.type,
                short: data.type,
                channel: '',
            },
            isContribution: false,
        };
        const updated = await new segmentRepository_1.default(this.options).update(segment.id, {
            customActivityTypes: activityTypes.custom,
        });
        return updated.activityTypes;
    }
    /**
     * unnest activity types with platform for easy access/manipulation
     * custom : {
     *    platform: {
     *         type1: settings1,
     *         type2: settings2
     *    }
     * }
     *
     * is transformed into
     * {
     *    type1: {...settings1, platform},
     *    type2: {...settings2, platform}
     * }
     *
     */
    static unnestActivityTypes(activityTypes) {
        return Object.keys(activityTypes.custom)
            .filter((k) => activityTypes.custom[k])
            .reduce((acc, platform) => {
            const unnestWithPlatform = Object.keys(activityTypes.custom[platform]).reduce((acc2, key) => {
                acc2[key] = Object.assign(Object.assign({}, activityTypes.custom[platform][key]), { platform });
                return acc2;
            }, {});
            acc = Object.assign(Object.assign({}, acc), unnestWithPlatform);
            return acc;
        }, {});
    }
    async updateActivityType(key, data) {
        if (!data.type) {
            throw new common_1.Error400(this.options.language, 'settings.activityTypes.errors.typeRequiredWhenUpdating');
        }
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(this.options);
        const activityTypes = segmentRepository_1.default.getActivityTypes(this.options);
        const activityTypesUnnested = SegmentService.unnestActivityTypes(activityTypes);
        // if key doesn't exist, throw 400
        if (!activityTypesUnnested[key]) {
            throw new common_1.Error400(this.options.language, 'settings.activityTypes.errors.notFound', key);
        }
        activityTypes.custom[activityTypesUnnested[key].platform][key] = {
            display: {
                default: data.type,
                short: data.type,
                channel: '',
            },
            isContribution: false,
        };
        const updated = await new segmentRepository_1.default(this.options).update(segment.id, {
            customActivityTypes: activityTypes.custom,
        });
        return updated.activityTypes;
    }
    async destroyActivityType(key) {
        const activityTypes = segmentRepository_1.default.getActivityTypes(this.options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(this.options);
        const activityTypesUnnested = SegmentService.unnestActivityTypes(activityTypes);
        if (activityTypesUnnested[key]) {
            delete activityTypes.custom[activityTypesUnnested[key].platform][key];
            const updated = await new segmentRepository_1.default(this.options).update(segment.id, {
                customActivityTypes: activityTypes.custom,
            });
            return updated.activityTypes;
        }
        return activityTypes;
    }
    static listActivityTypes(options) {
        return segmentRepository_1.default.getActivityTypes(options);
    }
    /**
     * update activity channels after checking for duplicates with platform key
     */
    async updateActivityChannels(data) {
        if (!data.channel) {
            throw new common_1.Error400(this.options.language, 'settings.activityChannels.errors.typeRequiredWhenCreating');
        }
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(this.options);
        const segmentRepository = new segmentRepository_1.default(this.options);
        await segmentRepository.addActivityChannel(segment.id, data.platform, data.channel);
    }
    async getTenantSubprojects(tenant) {
        const segmentRepository = new segmentRepository_1.default(Object.assign(Object.assign({}, this.options), { currentTenant: tenant }));
        const { rows } = await segmentRepository.querySubprojects({});
        return rows;
    }
    static async getTenantActivityTypes(subprojects) {
        if (!subprojects) {
            return { custom: {}, default: {} };
        }
        return subprojects.reduce((acc, subproject) => {
            const activityTypes = segmentRepository_1.default.buildActivityTypes(subproject);
            return {
                custom: Object.assign(Object.assign({}, acc.custom), activityTypes.custom),
                default: Object.assign(Object.assign({}, acc.default), activityTypes.default),
            };
        }, {});
    }
    static async getTenantActivityChannels(tenant, options) {
        const segmentRepository = new segmentRepository_1.default(Object.assign(Object.assign({}, options), { currentTenant: tenant }));
        const activityChannels = await segmentRepository.fetchTenantActivityChannels();
        return activityChannels;
    }
    collectSubprojectIds(segments, level) {
        if (level === types_1.SegmentLevel.PROJECT_GROUP) {
            return segments.map((s) => this.collectSubprojectIds(s.projects, types_1.SegmentLevel.PROJECT)).flat();
        }
        if (level === types_1.SegmentLevel.PROJECT) {
            return segments
                .map((s) => this.collectSubprojectIds(s.subprojects, types_1.SegmentLevel.SUB_PROJECT))
                .flat();
        }
        if (level === types_1.SegmentLevel.SUB_PROJECT) {
            return segments.map((s) => s.id);
        }
        throw new Error(`Unknown segment level: ${level}`);
    }
    setMembersCount(segments, level, membersCountPerSegment) {
        if (level === types_1.SegmentLevel.PROJECT_GROUP) {
            let total = 0;
            for (const projectGroup of segments) {
                projectGroup.members = this.setMembersCount(projectGroup.projects, types_1.SegmentLevel.PROJECT, membersCountPerSegment);
                total += projectGroup.members;
            }
            return total;
        }
        if (level === types_1.SegmentLevel.PROJECT) {
            let total = 0;
            for (const project of segments) {
                project.members = this.setMembersCount(project.subprojects, types_1.SegmentLevel.SUB_PROJECT, membersCountPerSegment);
                total += project.members;
            }
            return total;
        }
        if (level === types_1.SegmentLevel.SUB_PROJECT) {
            let total = 0;
            for (const subproject of segments) {
                subproject.members = membersCountPerSegment[subproject.id] || 0;
                total += subproject.members;
            }
            return total;
        }
        throw new Error(`Unknown segment level: ${level}`);
    }
    async addMemberCounts(segments, level) {
        const subprojectIds = this.collectSubprojectIds(segments, level);
        if (!subprojectIds.length) {
            return;
        }
        this.setMembersCount(segments, level, {});
    }
    static async refreshSegments(options) {
        const repo = new segmentRepository_1.default(options);
        for (let i = 0; i < options.currentSegments.length; i++) {
            options.currentSegments[i] = await repo.findById(options.currentSegments[i].id);
        }
    }
}
exports.default = SegmentService;
//# sourceMappingURL=segmentService.js.map