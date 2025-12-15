"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const models_1 = __importDefault(require("../models"));
const log = (0, logging_1.getServiceLogger)();
(0, models_1.default)(1000 * 30)
    .sequelize.sync({ alter: true })
    .then(() => {
    log.info('Database tables created!');
    process.exit();
})
    .catch((error) => {
    log.error(error, 'Error while creating database tables!');
    process.exit(1);
});
//# sourceMappingURL=create.js.map