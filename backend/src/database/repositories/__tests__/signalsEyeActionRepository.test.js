"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const signalsContentRepository_1 = __importDefault(require("../signalsContentRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const signalsActionRepository_1 = __importDefault(require("../signalsActionRepository"));
const db = null;
describe('signalsActionRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('createActionForContent method', () => {
        it('Should create a an action for a content succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const content = {
                platform: 'reddit',
                url: 'https://some-post-url',
                post: {
                    title: 'post title',
                    body: 'post body',
                },
                postedAt: '2020-05-27T15:13:30Z',
                tenantId: mockIRepositoryOptions.currentTenant.id,
            };
            const contentCreated = await signalsContentRepository_1.default.create(content, mockIRepositoryOptions);
            const action = {
                type: types_1.SignalsActionType.BOOKMARK,
                timestamp: '2022-07-27T19:13:30Z',
            };
            const actionCreated = await signalsActionRepository_1.default.createActionForContent(action, contentCreated.id, mockIRepositoryOptions);
            actionCreated.createdAt = actionCreated.createdAt.toISOString().split('T')[0];
            actionCreated.updatedAt = actionCreated.updatedAt.toISOString().split('T')[0];
            const expectedAction = Object.assign(Object.assign({ id: actionCreated.id }, action), { timestamp: new Date(actionCreated.timestamp), contentId: contentCreated.id, actionById: mockIRepositoryOptions.currentUser.id, tenantId: mockIRepositoryOptions.currentTenant.id, createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(), updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime() });
            expect(expectedAction).toStrictEqual(actionCreated);
        });
    });
});
//# sourceMappingURL=signalsActionRepository.test.js.map