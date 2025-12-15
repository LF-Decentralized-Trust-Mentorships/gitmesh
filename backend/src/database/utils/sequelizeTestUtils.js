"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const logging_1 = require("@gitmesh/logging");
const redis_1 = require("@gitmesh/redis");
const types_1 = require("@gitmesh/types");
const temporal_1 = require("@gitmesh/temporal");
const databaseConnection_1 = require("../databaseConnection");
const roles_1 = __importDefault(require("../../security/roles"));
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const tenantRepository_1 = __importDefault(require("../repositories/tenantRepository"));
const plans_1 = __importDefault(require("../../security/plans"));
const conf_1 = require("../../conf");
const settingsRepository_1 = __importDefault(require("../repositories/settingsRepository"));
class SequelizeTestUtils {
    static async wipeDatabase(db) {
        db = await this.getDatabase(db);
        await db.sequelize.query(`
      truncate table
        tenants,
        integrations,
        activities,
        members,
        automations,
        "automationExecutions",
        conversations,
        notes,
        reports,
        organizations,
        "organizationCaches",
        settings,
        tags,
        tasks,
        users,
        files,
        microservices,
        "signalsContents",
        "signalsActions",
        "auditLogs",
        "memberEnrichmentCache"
      cascade;
    `);
    }
    static async refreshMaterializedViews(db) {
        db = await this.getDatabase(db);
        await db.sequelize.query('refresh materialized view concurrently "memberActivityAggregatesMVs";');
    }
    static async getDatabase(db) {
        if (!db) {
            db = await (0, databaseConnection_1.databaseInit)();
        }
        return db;
    }
    static async getTestIServiceOptions(db, plan = plans_1.default.values.essential, tenantName, tenantUrl) {
        db = await this.getDatabase(db);
        const randomTenant = tenantName && tenantUrl
            ? this.getTenant(tenantName, tenantUrl, plan)
            : this.getRandomTestTenant(plan);
        const randomUser = await this.getRandomUser();
        let tenant = await db.tenant.create(randomTenant);
        const segment = (await db.segment.create({
            url: tenant.url,
            name: tenant.name,
            parentName: tenant.name,
            grandparentName: tenant.name,
            slug: 'default',
            parentSlug: 'default',
            grandparentSlug: 'default',
            status: types_1.SegmentStatus.ACTIVE,
            sourceId: null,
            sourceParentId: null,
            tenantId: tenant.id,
        })).get({ plain: true });
        let user = await db.user.create(randomUser);
        await db.tenantUser.create({
            roles: [roles_1.default.values.admin],
            status: 'active',
            tenantId: tenant.id,
            userId: user.id,
        });
        await settingsRepository_1.default.findOrCreateDefault({}, {
            language: 'en',
            currentUser: user,
            currentTenant: tenant,
            currentSegments: [segment],
            database: db,
        });
        tenant = await tenantRepository_1.default.findById(tenant.id, {
            database: db,
        });
        user = await userRepository_1.default.findById(user.id, {
            database: db,
            currentTenant: tenant,
            bypassPermissionValidation: true,
        });
        const log = (0, logging_1.getServiceLogger)();
        const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true);
        return {
            language: 'en',
            currentUser: user,
            currentTenant: tenant,
            currentSegments: [segment],
            database: db,
            log,
            redis,
            temporal: await (0, temporal_1.getTemporalClient)(conf_1.TEMPORAL_CONFIG),
        };
    }
    static async getTestIRepositoryOptions(db) {
        db = await this.getDatabase(db);
        const randomTenant = this.getRandomTestTenant();
        const randomUser = await this.getRandomUser();
        let tenant = await db.tenant.create(randomTenant);
        const segment = (await db.segment.create({
            url: tenant.url,
            name: tenant.name,
            parentName: tenant.name,
            grandparentName: tenant.name,
            slug: 'default',
            parentSlug: 'default',
            grandparentSlug: 'default',
            status: types_1.SegmentStatus.ACTIVE,
            description: null,
            sourceId: null,
            sourceParentId: null,
            tenantId: tenant.id,
        })).get({ plain: true });
        const user = await db.user.create(randomUser);
        await db.tenantUser.create({
            roles: ['admin'],
            status: 'active',
            tenantId: tenant.id,
            userId: user.id,
        });
        await settingsRepository_1.default.findOrCreateDefault({}, {
            language: 'en',
            currentUser: user,
            currentTenant: tenant,
            currentSegments: [segment],
            database: db,
        });
        tenant = await tenantRepository_1.default.findById(tenant.id, {
            database: db,
        });
        const log = (0, logging_1.getServiceLogger)();
        const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true);
        return {
            language: 'en',
            currentUser: user,
            currentTenant: tenant,
            currentSegments: [segment],
            database: db,
            bypassPermissionValidation: true,
            log,
            redis,
            temporal: await (0, temporal_1.getTemporalClient)(conf_1.TEMPORAL_CONFIG),
        };
    }
    static getRandomTestTenant(plan = plans_1.default.values.essential) {
        return this.getTenant(this.getRandomString('test-tenant'), this.getRandomString('url#'), plan);
    }
    static getTenant(name, url, plan = plans_1.default.values.essential) {
        return {
            name,
            url,
            plan,
        };
    }
    static async getRandomUser() {
        return {
            email: this.getRandomString('test-user-', '@gitmesh.dev'),
            password: await bcrypt_1.default.hash('12345', 12),
            emailVerified: true,
        };
    }
    static getUserToken(mockIRepositoryOptions) {
        const userId = mockIRepositoryOptions.currentUser.id;
        return jsonwebtoken_1.default.sign({ id: userId }, conf_1.API_CONFIG.jwtSecret, {
            expiresIn: conf_1.API_CONFIG.jwtExpiresIn,
        });
    }
    static getRandomString(prefix = '', suffix = '') {
        const randomTestSuffix = Math.trunc(Math.random() * 50000 + 1);
        return `${prefix}${randomTestSuffix}${suffix}`;
    }
    static getNowWithoutTime() {
        return moment_1.default.utc().format('YYYY-MM-DD');
    }
    static async closeConnection(db) {
        db = await this.getDatabase(db);
        db.sequelize.close();
    }
    static objectWithoutKey(object, key) {
        let objectWithoutKeys;
        if (typeof key === 'string') {
            const _a = object, _b = key, _ = _a[_b], otherKeys = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
            objectWithoutKeys = otherKeys;
        }
        else if (Array.isArray(key)) {
            objectWithoutKeys = key.reduce((acc, i) => {
                const _a = acc, _b = i, _ = _a[_b], otherKeys = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                acc = otherKeys;
                return acc;
            }, object);
        }
        return objectWithoutKeys;
    }
}
exports.default = SequelizeTestUtils;
//# sourceMappingURL=sequelizeTestUtils.js.map