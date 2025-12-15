"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
class MemberEnrichmentCacheRepository {
    /**
     * Inserts enrichment data into cache. If a member
     * already has an enrichment entry, row is updated with the latest given data.
     * Returns null if data is falsy or an empty object.
     * @param memberId enriched member's id
     * @param data enrichment data
     * @param options
     * @returns
     */
    static async upsert(memberId, data, options) {
        if (data && Object.keys(data).length > 0) {
            const transaction = sequelizeRepository_1.default.getTransaction(options);
            await options.database.sequelize.query(`INSERT INTO "memberEnrichmentCache" ("createdAt", "updatedAt", "memberId", "data")
          VALUES
              (now(), now(), :memberId, :data)
          ON CONFLICT ("memberId") DO UPDATE
          SET data = :data, "updatedAt" = now()
        `, {
                replacements: {
                    memberId,
                    data: JSON.stringify(data),
                },
                type: sequelize_1.QueryTypes.UPSERT,
                transaction,
            });
        }
        const cacheUpserted = await MemberEnrichmentCacheRepository.findByMemberId(memberId, options);
        return cacheUpserted;
    }
    /**
     * Finds member enrichment cache given memberId
     * Returns null if not found.
     * @param memberId enriched member's id
     * @param options
     * @returns
     */
    static async findByMemberId(memberId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const records = await options.database.sequelize.query(`select *
       from "memberEnrichmentCache"
       where "memberId" = :memberId;
    `, {
            replacements: {
                memberId,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (records.length === 0) {
            return null;
        }
        return records[0];
    }
}
exports.default = MemberEnrichmentCacheRepository;
//# sourceMappingURL=memberEnrichmentCacheRepository.js.map