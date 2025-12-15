"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
/**
 * This script is responsible for seeding entity data to database.
 * It has two modes through arguments. `all` OR `seederFileName`
 * It can either run all entity seeders (updates and creates)
 * using the `all` flag.
 * Or it can selectively run a single seeder using `[seederFileName]` argument
 * Examples:
 * ts-node seed-entities all => Runs all possible entity seeders in the initializers/entity folder
 * ts-node seed-entities conversations => Only runs the conversation seeder.(Useful in incremental db updates)
 */
const _2022_04_27_add_conversations_1 = __importDefault(require("./entities/2022-04-27-add-conversations"));
const _2022_04_05_add_microservices_1 = __importDefault(require("./entities/2022-04-05-add-microservices"));
const index_1 = require("../../conf/index");
const log = (0, logging_1.getServiceLogger)();
const arg = process.argv[2];
/**
 * Seeds all entities. Intended to be used in github actions
 * when creating :latest docker image
 */
async function seedAllEntities() {
    if (!index_1.IS_DEV_ENV) {
        throw new Error('This script is only allowed for development environment!');
    }
    await (0, _2022_04_27_add_conversations_1.default)();
    await (0, _2022_04_05_add_microservices_1.default)();
}
/**
 * This function is used to selectively run seeder functions
 * Selection is sent using the command line argument to the script
 * Intended to be used in staging/production environment for data changes
 */
async function seedSelected() {
    // eslint-disable-next-line import/no-dynamic-require
    const selectedInitializer = require(`./entities/${arg}`).default;
    await selectedInitializer();
}
if (arg) {
    if (arg === 'all') {
        seedAllEntities();
    }
    else {
        seedSelected();
    }
}
else {
    log.info('This script needs an argument. To run all initializers `all`, or to run a specific initializer, `initializerName`');
}
//# sourceMappingURL=seed-entities.js.map