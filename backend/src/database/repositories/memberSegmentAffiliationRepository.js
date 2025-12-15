"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const common_1 = require("@gitmesh/common");
const repositoryBase_1 = require("./repositoryBase");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
class MemberSegmentAffiliationRepository extends repositoryBase_1.RepositoryBase {
    constructor(options) {
        super(options, true);
    }
    async createOrUpdate(data) {
        if (!data.memberId) {
            throw new Error('memberId is required when creating a member segment affiliation.');
        }
        if (!data.segmentId) {
            throw new Error('segmentId is required when creating a member segment affiliation.');
        }
        if (data.organizationId === undefined) {
            throw new Error('organizationId is required when creating a member segment affiliation.');
        }
        const transaction = this.transaction;
        const affiliationInsertResult = await this.options.database.sequelize.query(`INSERT INTO "memberSegmentAffiliations" ("id", "memberId", "segmentId", "organizationId", "dateStart", "dateEnd")
          VALUES
              (:id, :memberId, :segmentId, :organizationId, :dateStart, :dateEnd)
          RETURNING "id"
        `, {
            replacements: {
                id: (0, uuid_1.v4)(),
                memberId: data.memberId,
                segmentId: data.segmentId,
                organizationId: data.organizationId,
                dateStart: data.dateStart || null,
                dateEnd: data.dateEnd || null,
            },
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
        await this.updateAffiliation(data.memberId, data.segmentId, data.organizationId);
        return this.findById(affiliationInsertResult[0][0].id);
    }
    async setForMember(memberId, data) {
        const seq = sequelizeRepository_1.default.getSequelize(this.options);
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        await seq.query(`
        DELETE FROM "memberSegmentAffiliations"
        WHERE "memberId" = :memberId
      `, {
            replacements: {
                memberId,
            },
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
        if (data.length === 0) {
            return;
        }
        const valuePlaceholders = data
            .map((_, i) => `(:id_${i}, :memberId_${i}, :segmentId_${i}, :organizationId_${i}, :dateStart_${i}, :dateEnd_${i})`)
            .join(', ');
        await seq.query(`
        INSERT INTO "memberSegmentAffiliations" ("id", "memberId", "segmentId", "organizationId", "dateStart", "dateEnd")
        VALUES ${valuePlaceholders}
      `, {
            replacements: data.reduce((acc, item, i) => {
                acc[`id_${i}`] = (0, uuid_1.v4)();
                acc[`memberId_${i}`] = memberId;
                acc[`segmentId_${i}`] = item.segmentId;
                acc[`organizationId_${i}`] = item.organizationId;
                acc[`dateStart_${i}`] = item.dateStart || null;
                acc[`dateEnd_${i}`] = item.dateEnd || null;
                return acc;
            }, {}),
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
    }
    async findById(id) {
        const transaction = this.transaction;
        const records = await this.options.database.sequelize.query(`SELECT *
       FROM "memberSegmentAffiliations"
       WHERE id = :id
      `, {
            replacements: {
                id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (records.length === 0) {
            return null;
        }
        return records[0];
    }
    async update(id, data) {
        const transaction = this.transaction;
        if (data.organizationId === undefined) {
            throw new Error('When updating member segment affiliation, organizationId is required.');
        }
        const affiliation = await this.findById(id);
        if (!affiliation) {
            throw new common_1.Error404();
        }
        await this.options.database.sequelize.query(`UPDATE "memberSegmentAffiliations" SET "organizationId" = :organizationId`, {
            replacements: {
                organizationId: data.organizationId,
            },
            type: sequelize_1.QueryTypes.UPDATE,
            transaction,
        });
        return this.findById(id);
    }
    async destroyAll(ids) {
        const transaction = this.transaction;
        const records = await this.findInIds(ids);
        if (ids.some((id) => records.find((r) => r.id === id) === undefined)) {
            throw new common_1.Error404();
        }
        await this.options.database.sequelize.query(`DELETE FROM "memberSegmentAffiliations" WHERE id in (:ids)
              `, {
            replacements: {
                ids,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
    }
    async findInIds(ids) {
        const transaction = this.transaction;
        const records = await this.options.database.sequelize.query(`SELECT *
             FROM "memberSegmentAffiliations"
             WHERE id in (:ids)
            `, {
            replacements: {
                ids,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return records;
    }
    async findForMember(memberId, timestamp) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(this.options);
        const seq = sequelizeRepository_1.default.getSequelize(this.options);
        const records = await seq.query(`
        SELECT * FROM "memberSegmentAffiliations"
        WHERE "memberId" = :memberId
          AND "segmentId" = :segmentId
          AND (
            ("dateStart" <= :timestamp AND "dateEnd" >= :timestamp)
            OR ("dateStart" <= :timestamp AND "dateEnd" IS NULL)
          )
        ORDER BY "dateStart" DESC, id
        LIMIT 1
      `, {
            replacements: {
                memberId,
                segmentId: segment.id,
                timestamp,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (records.length === 0) {
            return null;
        }
        return records[0];
    }
    async updateAffiliation(memberId, segmentId, organizationId) {
        const transaction = this.transaction;
        const query = `
      UPDATE activities
      SET "organizationId" = :organizationId
      WHERE "memberId" = :memberId
        AND "segmentId" = :segmentId
    `;
        await this.options.database.sequelize.query(query, {
            replacements: {
                memberId,
                segmentId,
                organizationId,
            },
            type: sequelize_1.QueryTypes.UPDATE,
            transaction,
        });
    }
}
exports.default = MemberSegmentAffiliationRepository;
//# sourceMappingURL=memberSegmentAffiliationRepository.js.map