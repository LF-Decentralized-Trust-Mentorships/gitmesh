"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeTestUtils_1 = __importDefault(require("../../database/utils/sequelizeTestUtils"));
const plans_1 = __importDefault(require("../../security/plans"));
const organizationService_1 = __importDefault(require("../organizationService"));
const db = null;
describe('OrganizationService tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await sequelizeTestUtils_1.default.closeConnection(db);
    });
    describe('Create method', () => {
        it('Should create organization', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db, plans_1.default.values.growth);
            const service = new organizationService_1.default(mockIServiceOptions);
            const toAdd = {
                identities: [
                    {
                        name: 'gitmesh.dev',
                        platform: 'gitmesh',
                    },
                ],
            };
            const added = await service.createOrUpdate(toAdd);
            expect(added.identities[0].url).toEqual(null);
        });
        it('Should throw an error when name is not sent', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db, plans_1.default.values.growth);
            const service = new organizationService_1.default(mockIServiceOptions);
            const toAdd = {};
            await expect(service.createOrUpdate(toAdd)).rejects.toThrowError('Missing organization identity while creating/updating organization!');
        });
        it('Should not re-create when existing: not enrich and name', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const service = new organizationService_1.default(mockIServiceOptions);
            const toAdd = {
                identities: [
                    {
                        name: 'gitmesh.dev',
                        platform: 'gitmesh',
                    },
                ],
            };
            await service.createOrUpdate(toAdd);
            const added = await service.createOrUpdate(toAdd);
            expect(added.identities[0].name).toEqual(toAdd.identities[0].name);
            expect(added.identities[0].url).toBeNull();
            const foundAll = await service.findAndCountAll({
                filter: {},
                includeOrganizationsWithoutMembers: true,
            });
            expect(foundAll.count).toBe(1);
        });
    });
});
//# sourceMappingURL=organizationService.test.js.map