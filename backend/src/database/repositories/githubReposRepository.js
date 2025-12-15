"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const trim_1 = __importDefault(require("lodash/trim"));
const sequelize_1 = require("sequelize");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
class GithubReposRepository {
    static async bulkInsert(table, columns, placeholdersFn, values, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        columns = columns.map((column) => (0, trim_1.default)(column, '"')).map((column) => `"${column}"`);
        const joinedColumns = columns.join(', ');
        const placeholders = values.map((value, idx) => placeholdersFn(idx));
        const replacements = values.reduce((acc, value) => {
            Object.entries(value).forEach(([key, value]) => {
                acc[key] = value;
            });
            return acc;
        }, {});
        return seq.query(`
        INSERT INTO "${table}"
        (${joinedColumns})
        VALUES ${placeholders.join(', ')}
        ON CONFLICT ("tenantId", "url")
        DO UPDATE SET "segmentId" = EXCLUDED."segmentId",
                      "integrationId" = EXCLUDED."integrationId"
      `, {
            replacements,
            transaction,
        });
    }
    static async updateMapping(integrationId, mapping, options) {
        const tenantId = options.currentTenant.id;
        await GithubReposRepository.bulkInsert('githubRepos', ['tenantId', 'integrationId', 'segmentId', 'url'], (idx) => `(:tenantId_${idx}, :integrationId_${idx}, :segmentId_${idx}, :url_${idx})`, Object.entries(mapping).map(([url, segmentId], idx) => ({
            [`tenantId_${idx}`]: tenantId,
            [`integrationId_${idx}`]: integrationId,
            [`segmentId_${idx}`]: segmentId,
            [`url_${idx}`]: url,
        })), options);
    }
    static async getMapping(integrationId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenantId = options.currentTenant.id;
        const results = await options.database.sequelize.query(`
        SELECT
          r.url,
          JSONB_BUILD_OBJECT(
            'id', s.id,
            'name', s.name
          ) as "segment"
        FROM "githubRepos" r
        JOIN segments s ON s.id = r."segmentId"
        WHERE r."integrationId" = :integrationId
        AND r."tenantId" = :tenantId
      `, {
            replacements: {
                integrationId,
                tenantId,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return results;
    }
}
exports.default = GithubReposRepository;
//# sourceMappingURL=githubReposRepository.js.map