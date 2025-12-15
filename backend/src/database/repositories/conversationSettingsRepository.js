"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
class ConversationSettingsRepository {
    static async findOrCreateDefault(defaults, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const [settings] = await options.database.conversationSettings.findOrCreate({
            where: { id: tenant.id, tenantId: tenant.id },
            defaults: Object.assign(Object.assign({}, defaults), { id: tenant.id, tenantId: tenant.id, createdById: currentUser ? currentUser.id : null }),
            transaction: sequelizeRepository_1.default.getTransaction(options),
        });
        return this._populateRelations(settings);
    }
    static async save(data, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const [conversationSettings] = await options.database.conversationSettings.findOrCreate({
            where: { id: tenant.id, tenantId: tenant.id },
            defaults: Object.assign(Object.assign({}, data), { id: tenant.id, tenantId: tenant.id, createdById: currentUser ? currentUser.id : null }),
            transaction,
        });
        await conversationSettings.update(data, {
            transaction,
        });
        await auditLogRepository_1.default.log({
            entityName: 'conversationSettings',
            entityId: conversationSettings.id,
            action: auditLogRepository_1.default.UPDATE,
            values: data,
        }, options);
        return this._populateRelations(conversationSettings);
    }
    static async _populateRelations(record) {
        if (!record) {
            return record;
        }
        return record.get({ plain: true });
    }
}
exports.default = ConversationSettingsRepository;
//# sourceMappingURL=conversationSettingsRepository.js.map