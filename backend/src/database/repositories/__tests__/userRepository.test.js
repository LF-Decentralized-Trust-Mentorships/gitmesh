"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const userRepository_1 = __importDefault(require("../userRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const roles_1 = __importDefault(require("../../../security/roles"));
const db = null;
describe('UserRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('findAllUsersOfTenant method', () => {
        it('Should find all related users of a tenant successfully', async () => {
            // Getting options already creates one random user
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            let allUsersOfTenant = (await userRepository_1.default.findAllUsersOfTenant(mockIRepositoryOptions.currentTenant.id)).map((u) => sequelizeTestUtils_1.default.objectWithoutKey(u, 'tenants'));
            expect(allUsersOfTenant).toStrictEqual([
                mockIRepositoryOptions.currentUser.get({ plain: true }),
            ]);
            // add more users to the test tenant
            const randomUser2 = await sequelizeTestUtils_1.default.getRandomUser();
            const user2 = await mockIRepositoryOptions.database.user.create(randomUser2);
            await mockIRepositoryOptions.database.tenantUser.create({
                roles: [roles_1.default.values.admin],
                status: 'active',
                tenantId: mockIRepositoryOptions.currentTenant.id,
                userId: user2.id,
            });
            allUsersOfTenant = (await userRepository_1.default.findAllUsersOfTenant(mockIRepositoryOptions.currentTenant.id)).map((u) => sequelizeTestUtils_1.default.objectWithoutKey(u, 'tenants'));
            expect(allUsersOfTenant).toStrictEqual([
                mockIRepositoryOptions.currentUser.get({ plain: true }),
                user2.get({ plain: true }),
            ]);
            const randomUser3 = await sequelizeTestUtils_1.default.getRandomUser();
            const user3 = await mockIRepositoryOptions.database.user.create(randomUser3);
            await mockIRepositoryOptions.database.tenantUser.create({
                roles: [roles_1.default.values.admin],
                status: 'active',
                tenantId: mockIRepositoryOptions.currentTenant.id,
                userId: user3.id,
            });
            allUsersOfTenant = (await userRepository_1.default.findAllUsersOfTenant(mockIRepositoryOptions.currentTenant.id)).map((u) => sequelizeTestUtils_1.default.objectWithoutKey(u, 'tenants'));
            expect(allUsersOfTenant).toStrictEqual([
                mockIRepositoryOptions.currentUser.get({ plain: true }),
                user2.get({ plain: true }),
                user3.get({ plain: true }),
            ]);
            // add  other users and tenants that are non related to previous couples
            await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            // users of the previous tenant should be the same
            allUsersOfTenant = (await userRepository_1.default.findAllUsersOfTenant(mockIRepositoryOptions.currentTenant.id)).map((u) => sequelizeTestUtils_1.default.objectWithoutKey(u, 'tenants'));
            expect(allUsersOfTenant).toStrictEqual([
                mockIRepositoryOptions.currentUser.get({ plain: true }),
                user2.get({ plain: true }),
                user3.get({ plain: true }),
            ]);
            const tenantUsers = await mockIRepositoryOptions.database.tenantUser.findAll({
                tenantId: mockIRepositoryOptions.currentTenant.id,
            });
            // remove last user added to the tenant
            await tenantUsers[2].destroy({ force: true });
            allUsersOfTenant = (await userRepository_1.default.findAllUsersOfTenant(mockIRepositoryOptions.currentTenant.id)).map((u) => sequelizeTestUtils_1.default.objectWithoutKey(u, 'tenants'));
            expect(allUsersOfTenant).toStrictEqual([
                mockIRepositoryOptions.currentUser.get({ plain: true }),
                user2.get({ plain: true }),
            ]);
            // remove first user added to the tenant
            await tenantUsers[0].destroy({ force: true });
            allUsersOfTenant = (await userRepository_1.default.findAllUsersOfTenant(mockIRepositoryOptions.currentTenant.id)).map((u) => sequelizeTestUtils_1.default.objectWithoutKey(u, 'tenants'));
            expect(allUsersOfTenant).toStrictEqual([user2.get({ plain: true })]);
            // remove the last remaining user from the tenant
            await tenantUsers[1].destroy({ force: true });
            // function now should be throwing Error404
            await expect(() => userRepository_1.default.findAllUsersOfTenant(mockIRepositoryOptions.currentTenant.id)).rejects.toThrowError(new common_1.Error404());
        });
    });
});
//# sourceMappingURL=userRepository.test.js.map