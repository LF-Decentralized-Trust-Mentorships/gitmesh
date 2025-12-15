"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const sequelize_1 = require("sequelize");
const repositoryBase_1 = require("./repositoryBase");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
class MemberSyncRemoteRepository extends repositoryBase_1.RepositoryBase {
    constructor(options) {
        super(options, true);
    }
    async stopSyncingAutomation(automationId) {
        await this.options.database.sequelize.query(`update "membersSyncRemote" set status = :status where "syncFrom" = :automationId
        `, {
            replacements: {
                status: types_1.SyncStatus.STOPPED,
                automationId,
            },
            type: sequelize_1.QueryTypes.UPDATE,
        });
    }
    async findRemoteSync(integrationId, memberId, syncFrom) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const records = await this.options.database.sequelize.query(`SELECT *
             FROM "membersSyncRemote"
             WHERE "integrationId" = :integrationId and "memberId" = :memberId and "syncFrom" = :syncFrom;
            `, {
            replacements: {
                integrationId,
                memberId,
                syncFrom,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (records.length === 0) {
            return null;
        }
        return records[0];
    }
    async startManualSync(id, sourceId) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        await this.options.database.sequelize.query(`update "membersSyncRemote" set status = :status, "sourceId" = :sourceId where "id" = :id
        `, {
            replacements: {
                status: types_1.SyncStatus.ACTIVE,
                id,
                sourceId: sourceId || null,
            },
            type: sequelize_1.QueryTypes.UPDATE,
            transaction,
        });
    }
    async stopMemberManualSync(memberId) {
        await this.options.database.sequelize.query(`update "membersSyncRemote" set status = :status where "memberId" = :memberId and "syncFrom" = :manualSync
        `, {
            replacements: {
                status: types_1.SyncStatus.STOPPED,
                memberId,
                manualSync: 'manual',
            },
            type: sequelize_1.QueryTypes.UPDATE,
        });
    }
    async destroyAllAutomation(automationIds) {
        const transaction = this.transaction;
        const seq = this.seq;
        const query = `
    delete 
    from "membersSyncRemote"
    where "syncFrom" in (:automationIds);`;
        await seq.query(query, {
            replacements: {
                automationIds,
            },
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
    }
    async destroyAllIntegration(integrationIds) {
        const transaction = this.transaction;
        const seq = this.seq;
        const query = `
    delete 
    from "membersSyncRemote"
    where "integrationId" in (:integrationIds);`;
        await seq.query(query, {
            replacements: {
                integrationIds,
            },
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
    }
    async markMemberForSyncing(data) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const existingSyncRemote = await this.findByMemberId(data.memberId);
        if (existingSyncRemote) {
            data.sourceId = existingSyncRemote.sourceId;
        }
        const existingManualSyncRemote = await this.findRemoteSync(data.integrationId, data.memberId, data.syncFrom);
        if (existingManualSyncRemote) {
            await this.startManualSync(existingManualSyncRemote.id, data.sourceId);
            return existingManualSyncRemote;
        }
        const memberSyncRemoteInserted = await this.options.database.sequelize.query(`insert into "membersSyncRemote" ("id", "memberId", "sourceId", "integrationId", "syncFrom", "metaData", "lastSyncedAt", "status")
          values
              (:id, :memberId, :sourceId, :integrationId, :syncFrom, :metaData, :lastSyncedAt, :status)
          returning "id"
        `, {
            replacements: {
                id: (0, common_1.generateUUIDv1)(),
                memberId: data.memberId,
                integrationId: data.integrationId,
                syncFrom: data.syncFrom,
                metaData: data.metaData,
                lastSyncedAt: data.lastSyncedAt || null,
                sourceId: data.sourceId || null,
                status: types_1.SyncStatus.ACTIVE,
            },
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
        const memberSyncRemote = await this.findById(memberSyncRemoteInserted[0][0].id);
        return memberSyncRemote;
    }
    async findMemberManualSync(memberId) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const records = await this.options.database.sequelize.query(`select i.platform, msr.status from "membersSyncRemote" msr
      inner join integrations i on msr."integrationId" = i.id
      where msr."syncFrom" = :syncFrom and msr."memberId" = :memberId;
            `, {
            replacements: {
                memberId,
                syncFrom: 'manual',
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return records;
    }
    async findByMemberId(memberId) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const records = await this.options.database.sequelize.query(`SELECT *
             FROM "membersSyncRemote"
             WHERE "memberId" = :memberId
             and "sourceId" is not null
             limit 1;
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
    async findById(id) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const records = await this.options.database.sequelize.query(`SELECT *
             FROM "membersSyncRemote"
             WHERE id = :id;
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
}
exports.default = MemberSyncRemoteRepository;
//# sourceMappingURL=memberSyncRemoteRepository.js.map