"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const workerTypes_1 = require("../../serverless/types/workerTypes");
const job = {
    name: 'Signals Email Digest Ticker',
    // every half hour
    cronTime: '*/30 * * * *',
    onTrigger: async () => {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const tenantUsers = (await options.database.tenantUser.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    {
                        'settings.signals.emailDigestActive': {
                            [sequelize_1.Op.ne]: null,
                        },
                    },
                    {
                        'settings.signals.emailDigestActive': {
                            [sequelize_1.Op.eq]: true,
                        },
                    },
                ],
            },
        })).filter((tenantUser) => tenantUser.settings.signals &&
            tenantUser.settings.signals.emailDigestActive &&
            (0, moment_1.default)() > (0, moment_1.default)(tenantUser.settings.signals.emailDigest.nextEmailAt));
        for (const tenantUser of tenantUsers) {
            await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenantUser.tenantId, {
                type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                user: tenantUser.userId,
                tenant: tenantUser.tenantId,
                service: 'signals-email-digest',
            });
        }
    },
};
exports.default = job;
//# sourceMappingURL=signalsEmailDigestTicks.js.map