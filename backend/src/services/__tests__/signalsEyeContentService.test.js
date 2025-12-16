"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const sequelizeTestUtils_1 = __importDefault(require("../../database/utils/sequelizeTestUtils"));
const signalsContentService_1 = __importDefault(require("../signalsContentService"));
const db = null;
describe('SignalsContentService tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await sequelizeTestUtils_1.default.closeConnection(db);
    });
    describe('upsert method', () => {
        it('Should create or update a single content using URL field', async () => {
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
                actions: [
                    {
                        type: types_1.SignalsActionType.BOOKMARK,
                        timestamp: '2022-06-27T14:13:30Z',
                    },
                ],
            };
            const service = new signalsContentService_1.default(mockIRepositoryOptions);
            const c1 = await service.upsert(content);
            let contents = await service.query({});
            expect(contents.count).toBe(1);
            expect(contents.rows).toStrictEqual([c1]);
            // upsert previous url with some new fields
            const contentWithSameUrl = {
                platform: 'reddit',
                url: 'https://some-post-url',
                post: {
                    title: 'a brand new post title',
                    body: 'better post body',
                },
                postedAt: '2020-05-27T15:13:30Z',
                tenantId: mockIRepositoryOptions.currentTenant.id,
            };
            const c1Upserted = await service.upsert(contentWithSameUrl);
            contents = await service.query({});
            expect(contents.count).toBe(1);
            expect(contents.rows).toStrictEqual([c1Upserted]);
            expect(c1Upserted.id).toEqual(c1.id);
            expect(contents.rows[0].post).toStrictEqual(contentWithSameUrl.post);
        });
    });
});
//# sourceMappingURL=signalsContentService.test.js.map