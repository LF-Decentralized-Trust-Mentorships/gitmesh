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
class OrganizationSyncRemoteRepository extends repositoryBase_1.RepositoryBase {
    constructor(options) {
        super(options, true);
    }
    async stopSyncingAutomation(automationId) {
        await this.options.database.sequelize.query(`update "organizationsSyncRemote" set status = :status where "syncFrom" = :automationId
        `, {
            replacements: {
                status: types_1.SyncStatus.STOPPED,
                automationId,
            },
            type: sequelize_1.QueryTypes.UPDATE,
        });
    }
    async stopOrganizationManualSync(organizationId) {
        await this.options.database.sequelize.query(`update "organizationsSyncRemote" set status = :status where "organizationId" = :organizationId and "syncFrom" = :manualSync
        `, {
            replacements: {
                status: types_1.SyncStatus.STOPPED,
                organizationId,
                manualSync: 'manual',
            },
            type: sequelize_1.QueryTypes.UPDATE,
        });
    }
    async startManualSync(id, sourceId) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        await this.options.database.sequelize.query(`update "organizationsSyncRemote" set status = :status, "sourceId" = :sourceId where "id" = :id
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
    async findRemoteSync(integrationId, organizationId, syncFrom) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const records = await this.options.database.sequelize.query(`SELECT *
             FROM "organizationsSyncRemote"
             WHERE "integrationId" = :integrationId and "organizationId" = :organizationId and "syncFrom" = :syncFrom;
            `, {
            replacements: {
                integrationId,
                organizationId,
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
    async markOrganizationForSyncing(data) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const existingSyncRemote = await this.findByOrganizationId(data.organizationId);
        if (existingSyncRemote) {
            data.sourceId = existingSyncRemote.sourceId;
        }
        const existingManualSyncRemote = await this.findRemoteSync(data.integrationId, data.organizationId, data.syncFrom);
        if (existingManualSyncRemote) {
            await this.startManualSync(existingManualSyncRemote.id, data.sourceId);
            return existingManualSyncRemote;
        }
        const organizationSyncRemoteInserted = await this.options.database.sequelize.query(`insert into "organizationsSyncRemote" ("id", "organizationId", "sourceId", "integrationId", "syncFrom", "metaData", "lastSyncedAt", "status")
          VALUES
              (:id, :organizationId, :sourceId, :integrationId, :syncFrom, :metaData, :lastSyncedAt, :status)
          returning "id"
        `, {
            replacements: {
                id: (0, common_1.generateUUIDv1)(),
                organizationId: data.organizationId,
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
        const organizationSyncRemote = await this.findById(organizationSyncRemoteInserted[0][0].id);
        return organizationSyncRemote;
    }
    async destroyAllAutomation(automationIds) {
        const transaction = this.transaction;
        const seq = this.seq;
        const query = `
    delete 
    from "organizationsSyncRemote"
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
    from "organizationsSyncRemote"
    where "integrationId" in (:integrationIds);`;
        await seq.query(query, {
            replacements: {
                integrationIds,
            },
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
    }
    async findOrganizationManualSync(organizationId) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const records = await this.options.database.sequelize.query(`select i.platform, osr.status from "organizationsSyncRemote" osr
      inner join integrations i on osr."integrationId" = i.id
      where osr."syncFrom" = :syncFrom and osr."organizationId" = :organizationId;
            `, {
            replacements: {
                organizationId,
                syncFrom: 'manual',
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return records;
    }
    async findByOrganizationId(organizationId) {
        const transaction = sequelizeRepository_1.default.getTransaction(this.options);
        const records = await this.options.database.sequelize.query(`SELECT *
             FROM "organizationsSyncRemote"
             WHERE "organizationId" = :organizationId
             and "sourceId" is not null
             limit 1;
            `, {
            replacements: {
                organizationId,
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
             FROM "organizationsSyncRemote"
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
exports.default = OrganizationSyncRemoteRepository;
//# sourceMappingURL=organizationSyncRemoteRepository.js.map