"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeActionState = exports.MergeActionType = exports.MergeActionsRepository = void 0;
const sequelize_1 = require("sequelize");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var MergeActionType;
(function (MergeActionType) {
    MergeActionType["ORG"] = "org";
    MergeActionType["MEMBER"] = "member";
})(MergeActionType || (MergeActionType = {}));
exports.MergeActionType = MergeActionType;
var MergeActionState;
(function (MergeActionState) {
    MergeActionState["PENDING"] = "pending";
    MergeActionState["IN_PROGRESS"] = "in-progress";
    MergeActionState["DONE"] = "done";
    MergeActionState["ERROR"] = "error";
})(MergeActionState || (MergeActionState = {}));
exports.MergeActionState = MergeActionState;
class MergeActionsRepository {
    static async add(type, primaryId, secondaryId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenantId = options.currentTenant.id;
        await options.database.sequelize.query(`
        INSERT INTO "mergeActions" ("tenantId", "type", "primaryId", "secondaryId", state)
        VALUES (:tenantId, :type, :primaryId, :secondaryId, :state)
        ON CONFLICT ("tenantId", "type", "primaryId", "secondaryId")
        DO UPDATE SET state = :state
      `, {
            replacements: {
                tenantId,
                type,
                primaryId,
                secondaryId,
                state: MergeActionState.PENDING,
            },
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
    }
    static async setState(type, primaryId, secondaryId, state, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenantId = options.currentTenant.id;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, rowCount] = await options.database.sequelize.query(`
        UPDATE "mergeActions"
        SET state = :state
        WHERE "tenantId" = :tenantId
          AND type = :type
          AND "primaryId" = :primaryId
          AND "secondaryId" = :secondaryId
          AND state != :state
      `, {
            replacements: {
                tenantId,
                type,
                primaryId,
                secondaryId,
                state,
            },
            type: sequelize_1.QueryTypes.UPDATE,
            transaction,
        });
        return rowCount > 0;
    }
}
exports.MergeActionsRepository = MergeActionsRepository;
//# sourceMappingURL=mergeActionsRepository.js.map