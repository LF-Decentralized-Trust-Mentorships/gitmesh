"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTEGRATION_SERVICES = void 0;
const logging_1 = require("@gitmesh/logging");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const log = (0, logging_1.getServiceChildLogger)('integrations');
exports.INTEGRATION_SERVICES = [];
const intFolder = path_1.default.resolve(`${__dirname}/`);
const integrationFolders = fs_1.default
    .readdirSync(intFolder, { withFileTypes: true })
    .filter((dir) => dir.isDirectory() &&
    dir.name !== 'premium' &&
    fs_1.default.existsSync(`${intFolder}/${dir.name}/index.ts`));
for (const intFolder of integrationFolders) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    exports.INTEGRATION_SERVICES.push(require(`./${intFolder.name}`).default);
}
// add premium integrations - check for js because library is compiled to javascript
const premiumFolder = path_1.default.resolve(`${__dirname}/premium`);
if (fs_1.default.existsSync(premiumFolder)) {
    const premiumIntFolders = fs_1.default
        .readdirSync(premiumFolder, { withFileTypes: true })
        .filter((dir) => dir.isDirectory() && fs_1.default.existsSync(`${premiumFolder}/${dir.name}/index.ts`));
    if (premiumIntFolders.length > 0) {
        for (const premiumIntFolder of premiumIntFolders) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            exports.INTEGRATION_SERVICES.push(require(`./premium/${premiumIntFolder.name}`).default);
        }
    }
}
log.info({ types: exports.INTEGRATION_SERVICES.map((i) => i.type) }, `Loaded ${exports.INTEGRATION_SERVICES.length} integrations`);
//# sourceMappingURL=services.js.map