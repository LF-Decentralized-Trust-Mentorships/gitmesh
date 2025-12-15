"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const sequelize_1 = require("sequelize");
const repositoryBase_1 = require("./repositoryBase");
class RecurringEmailsHistoryRepository extends repositoryBase_1.RepositoryBase {
    constructor(options) {
        super(options, true);
    }
    /**
     * Inserts recurring emails receipt history.
     * @param data recurring emails historical data
     * @param options
     * @returns
     */
    async create(data) {
        const historyInserted = await this.options.database.sequelize.query(`INSERT INTO "recurringEmailsHistory" ("id", "type", "tenantId", "weekOfYear", "emailSentAt", "emailSentTo")
          VALUES
              (:id, :type, :tenantId, :weekOfYear, :emailSentAt, ARRAY[:emailSentTo])
          RETURNING "id"
        `, {
            replacements: {
                id: (0, common_1.generateUUIDv1)(),
                type: data.type,
                tenantId: data.tenantId,
                weekOfYear: data.weekOfYear || null,
                emailSentAt: data.emailSentAt,
                emailSentTo: data.emailSentTo,
            },
            type: sequelize_1.QueryTypes.INSERT,
        });
        const emailHistory = await this.findById(historyInserted[0][0].id);
        return emailHistory;
    }
    /**
     * Finds a historical entry given tenantId and weekOfYear
     * Returns null if not found.
     * @param tenantId
     * @param weekOfYear
     * @param options
     * @returns
     */
    async findByWeekOfYear(tenantId, weekOfYear, type) {
        const records = await this.options.database.sequelize.query(`SELECT *
             FROM "recurringEmailsHistory"
             WHERE "tenantId" = :tenantId
             AND "weekOfYear" = :weekOfYear
             and "type" = :type;
            `, {
            replacements: {
                tenantId,
                weekOfYear,
                type,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (records.length === 0) {
            return null;
        }
        return records[0];
    }
    /**
     * Finds a historical entry by id.
     * Returns null if not found
     * @param id
     * @param options
     * @returns
     */
    async findById(id) {
        const records = await this.options.database.sequelize.query(`SELECT *
             FROM "recurringEmailsHistory"
             WHERE id = :id;
            `, {
            replacements: {
                id,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (records.length === 0) {
            return null;
        }
        return records[0];
    }
}
exports.default = RecurringEmailsHistoryRepository;
//# sourceMappingURL=recurringEmailsHistoryRepository.js.map