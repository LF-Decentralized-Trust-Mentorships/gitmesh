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
describe('signalsContentRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create a content succesfully', async () => {
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
            const created = await signalsContentRepository_1.default.create(content, mockIRepositoryOptions);
            created.createdAt = created.createdAt.toISOString().split('T')[0];
            created.updatedAt = created.updatedAt.toISOString().split('T')[0];
            const expectedCreated = Object.assign(Object.assign({ id: created.id }, content), { postedAt: new Date(content.postedAt), actions: [], createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(), updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(), tenantId: mockIRepositoryOptions.currentTenant.id });
            expect(created).toStrictEqual(expectedCreated);
        });
        /*
    
        it('Should create a content with unix timestamp', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          const withUnix = {
            sourceId: 'sourceId',
            vectorId: '123',
            status: null,
            platform: 'hacker_news',
            title: 'title',
            postAttributes: {
              score: 10,
            },
            userAttributes: { [PlatformType.GITHUB]: 'hey', [PlatformType.TWITTER]: 'ho' },
            text: 'text',
            url: 'url',
            timestamp: 1660712134,
    
            username: 'username',
            keywords: ['keyword1', 'keyword2'],
            similarityScore: 0.9,
          }
    
          const created = await SignalsContentRepository.upsert(withUnix, mockIRepositoryOptions)
    
          created.createdAt = created.createdAt.toISOString().split('T')[0]
          created.updatedAt = created.updatedAt.toISOString().split('T')[0]
    
          const expectedCreated = {
            id: created.id,
            ...toCreate,
            timestamp: new Date(1660712134 * 1000),
            importHash: null,
            createdAt: SequelizeTestUtils.getNowWithoutTime(),
            updatedAt: SequelizeTestUtils.getNowWithoutTime(),
            deletedAt: null,
            tenantId: mockIRepositoryOptions.currentTenant.id,
            createdById: mockIRepositoryOptions.currentUser.id,
            updatedById: mockIRepositoryOptions.currentUser.id,
          }
          expect(created).toStrictEqual(expectedCreated)
        })
    
        
    
      
      })
    
      describe('find by id method', () => {
        it('Should find an existing record', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
          const created = await SignalsContentRepository.upsert(toCreate, mockIRepositoryOptions)
    
          const id = created.id
          const found = await SignalsContentRepository.findById(id, mockIRepositoryOptions)
          expect(found.id).toBe(id)
        })
    
        it('Should throw 404 error when no tag found with given id', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
          const { randomUUID } = require('crypto')
    
          await expect(() =>
            SignalsContentRepository.findById(randomUUID(), mockIRepositoryOptions),
          ).rejects.toThrowError(new Error404())
        })
      })
    
      describe('find and count all method', () => {
        it('Should find all records without filters', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          const found = await SignalsContentRepository.findAndCountAll(
            { filter: {} },
            mockIRepositoryOptions,
          )
          expect(found.count).toBe(5)
        })
    
        it('Filter by date', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          const found = await SignalsContentRepository.findAndCountAll(
            {
              filter: {
                timestampRange: [moment().subtract(1, 'day').toISOString()],
              },
            },
            mockIRepositoryOptions,
          )
          expect(found.count).toBe(3)
        })
    
        it('Filter by nDays', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          const found = await SignalsContentRepository.findAndCountAll(
            {
              filter: {
                nDays: 1,
              },
            },
            mockIRepositoryOptions,
          )
          expect(found.count).toBe(3)
        })
    
        it('Filter by status NULL', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          const found = await SignalsContentRepository.findAndCountAll(
            {
              filter: {
                status: 'NULL',
              },
            },
            mockIRepositoryOptions,
          )
          expect(found.count).toBe(3)
        })
    
        it('Filter by status NOT_NULL', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          const found = await SignalsContentRepository.findAndCountAll(
            {
              filter: {
                status: 'NOT_NULL',
              },
            },
            mockIRepositoryOptions,
          )
          expect(found.count).toBe(2)
        })
    
        it('Filter by status engaged', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          const found = await SignalsContentRepository.findAndCountAll(
            {
              filter: {
                status: 'engaged',
              },
            },
            mockIRepositoryOptions,
          )
          expect(found.count).toBe(1)
        })
    
        it('Filter by status rejected', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          const found = await SignalsContentRepository.findAndCountAll(
            {
              filter: {
                status: 'rejected',
              },
            },
            mockIRepositoryOptions,
          )
          expect(found.count).toBe(1)
        })
    
        it('Filter by platform', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          const found = await SignalsContentRepository.findAndCountAll(
            {
              filter: {
                platforms: 'hacker_news',
              },
            },
            mockIRepositoryOptions,
          )
          expect(found.count).toBe(2)
        })
    
        it('Filter by several platforms', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
          await new SignalsContentService(mockIRepositoryOptions).upsert({
            sourceId: 't1',
            vectorId: 't1',
            url: 'url devto 3',
            username: 'devtousername3',
            status: null,
            platform: 'twitter',
            timestamp: moment().subtract(1, 'week').toDate(),
            keywords: ['keyword3', 'keyword2'],
            title: 'title devto 3',
          })
    
          const found = await SignalsContentRepository.findAndCountAll(
            {
              filter: {
                platforms: 'hacker_news,twitter',
              },
            },
            mockIRepositoryOptions,
          )
          expect(found.count).toBe(3)
        })
    
        it('Filter by timestamp and status', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          expect(
            (
              await SignalsContentRepository.findAndCountAll(
                {
                  filter: {
                    timestampRange: [moment().subtract(1, 'day').toISOString()],
                    status: 'NULL',
                  },
                },
                mockIRepositoryOptions,
              )
            ).count,
          ).toBe(2)
        })
    
        it('Filter by keywords', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          await addAll(mockIRepositoryOptions)
    
          const k1 = {
            sourceId: 'sourceIdk1',
            vectorId: 'sourceIdk1',
            status: null,
            platform: 'hacker_news',
            title: 'title',
            userAttributes: { [PlatformType.GITHUB]: 'hey', [PlatformType.TWITTER]: 'ho' },
            text: 'text',
            postAttributes: {
              score: 10,
            },
            url: 'url',
            timestamp: new Date(),
            username: 'username',
            keywords: ['keyword1'],
            similarityScore: 0.9,
          }
    
          await new SignalsContentService(mockIRepositoryOptions).upsert(k1)
    
          const k2 = {
            sourceId: 'sourceIdk2',
            vectorId: 'sourceIdk2',
            status: null,
            platform: 'hacker_news',
            title: 'title',
            userAttributes: { [PlatformType.GITHUB]: 'hey', [PlatformType.TWITTER]: 'ho' },
            text: 'text',
            postAttributes: {
              score: 10,
            },
            url: 'url',
            timestamp: new Date(),
            username: 'username',
            keywords: ['keyword2'],
            similarityScore: 0.9,
          }
    
          try {
            await SignalsContentRepository.findAndCountAll(
              {
                filter: {
                  keywords: 'keyword1,keyword2',
                },
              },
              mockIRepositoryOptions,
            )
          } catch (e) {
            console.log(e)
          }
    
          await new SignalsContentService(mockIRepositoryOptions).upsert(k2)
    
          expect(
            (
              await SignalsContentRepository.findAndCountAll(
                {
                  filter: {
                    keywords: 'keyword1,keyword2',
                  },
                },
                mockIRepositoryOptions,
              )
            ).count,
          ).toBe(5)
        })
      })
    
      describe('update method', () => {
        it('Should update a record', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          const created = await SignalsContentRepository.upsert(toCreate, mockIRepositoryOptions)
    
          const id = created.id
          const updated = await SignalsContentRepository.update(
            id,
            { status: 'rejected', username: 'updated' },
            mockIRepositoryOptions,
          )
          expect(updated.id).toBe(id)
          expect(updated.status).toBe('rejected')
          expect(updated.username).toBe('updated')
        })
    
        it('Should throw 404 error when no content found with given id', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
          const { randomUUID } = require('crypto')
    
          await expect(() =>
            SignalsContentRepository.update(randomUUID(), {}, mockIRepositoryOptions),
          ).rejects.toThrowError(new Error404())
        })
    
        it('Should throw an error for an invalid status', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          const created = await SignalsContentRepository.upsert(toCreate, mockIRepositoryOptions)
    
          const id = created.id
    
          await expect(() =>
            SignalsContentRepository.update(id, { status: 'smth' }, mockIRepositoryOptions),
          ).rejects.toThrowError(new Error400('en', 'errors.invalidSignalsStatus.message'))
        })
    
        it('Keywords should not be updated', async () => {
          const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)
    
          const created = await SignalsContentRepository.upsert(toCreate, mockIRepositoryOptions)
    
          const id = created.id
          const updated = await SignalsContentRepository.update(
            id,
            { keywords: ['1', '2'] },
            mockIRepositoryOptions,
          )
          expect(updated.id).toBe(id)
          expect(updated.keywords).toStrictEqual(created.keywords)
        })
      })
      */
    });
    describe('findAndCountAll method', () => {
        it('Should find signals contant, various cases', async () => {
            // create random tenant with one user
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            // create additional users for same tenant to test out actionBy filtering
            const randomUser = await sequelizeTestUtils_1.default.getRandomUser();
            console.log('random user: ');
            console.log(randomUser);
            const user2 = await mockIRepositoryOptions.database.user.create(randomUser);
            await mockIRepositoryOptions.database.tenantUser.create({
                roles: ['admin'],
                status: 'active',
                tenantId: mockIRepositoryOptions.currentTenant.id,
                userId: user2.id,
            });
            // create few content
            // one without any actions
            await signalsContentRepository_1.default.create({
                platform: 'reddit',
                url: 'https://some-reddit-url',
                post: {
                    title: 'post title',
                    body: 'post body',
                },
                postedAt: '2020-05-27T15:13:30Z',
                tenantId: mockIRepositoryOptions.currentTenant.id,
            }, mockIRepositoryOptions);
            // one with a bookmark action
            let c2 = await signalsContentRepository_1.default.create({
                platform: 'hackernews',
                url: 'https://some-hackernews-url',
                post: {
                    title: 'post title',
                    body: 'post body',
                },
                postedAt: '2022-06-27T19:14:44Z',
                tenantId: mockIRepositoryOptions.currentTenant.id,
            }, mockIRepositoryOptions);
            // add bookmark action
            await signalsActionRepository_1.default.createActionForContent({
                type: types_1.SignalsActionType.BOOKMARK,
                timestamp: '2022-07-27T19:13:30Z',
            }, c2.id, mockIRepositoryOptions);
            c2 = await signalsContentRepository_1.default.findById(c2.id, mockIRepositoryOptions);
            // another content with a thumbs-up(user1) and a bookmark(user2) action
            let c3 = await signalsContentRepository_1.default.create({
                platform: 'devto',
                url: 'https://some-devto-url',
                post: {
                    title: 'post title',
                    body: 'post body',
                },
                postedAt: '2022-06-27T19:14:44Z',
                tenantId: mockIRepositoryOptions.currentTenant.id,
            }, mockIRepositoryOptions);
            // add the thumbs up action
            await signalsActionRepository_1.default.createActionForContent({
                type: types_1.SignalsActionType.THUMBS_UP,
                timestamp: '2022-09-30T23:11:10Z',
            }, c3.id, mockIRepositoryOptions);
            // also add bookmark from user2
            await signalsActionRepository_1.default.createActionForContent({
                type: types_1.SignalsActionType.BOOKMARK,
                timestamp: '2022-09-30T23:11:10Z',
            }, c3.id, Object.assign(Object.assign({}, mockIRepositoryOptions), { currentUser: user2 }));
            c3 = await signalsContentRepository_1.default.findById(c3.id, mockIRepositoryOptions);
            // filter by action type
            let res = await signalsContentRepository_1.default.findAndCountAll({
                advancedFilter: {
                    action: {
                        type: types_1.SignalsActionType.BOOKMARK,
                    },
                },
            }, mockIRepositoryOptions);
            expect(res.count).toBe(2);
            expect(res.rows.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))).toStrictEqual([c2, c3]);
            // filter by actionBy
            res = await signalsContentRepository_1.default.findAndCountAll({
                advancedFilter: {
                    action: {
                        actionById: user2.id,
                    },
                },
            }, mockIRepositoryOptions);
            expect(res.count).toBe(1);
            expect(res.rows).toStrictEqual([c3]);
        });
    });
});
//# sourceMappingURL=signalsContentRepository.test.js.map