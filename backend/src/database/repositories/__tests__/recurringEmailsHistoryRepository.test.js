"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const recurringEmailsHistoryTypes_1 = require("../../../types/recurringEmailsHistoryTypes");
const recurringEmailsHistoryRepository_1 = __importDefault(require("../recurringEmailsHistoryRepository"));
const db = null;
describe('RecurringEmailsHistory tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create recurring email history with given values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const historyData = {
                emailSentAt: '2023-01-02T00:00:00Z',
                type: recurringEmailsHistoryTypes_1.RecurringEmailType.WEEKLY_ANALYTICS,
                emailSentTo: ['anil@gitmesh.dev', 'uros@gitmesh.dev'],
                tenantId: mockIRepositoryOptions.currentTenant.id,
                weekOfYear: '1',
            };
            const rehRepository = new recurringEmailsHistoryRepository_1.default(mockIRepositoryOptions);
            const history = await rehRepository.create(historyData);
            expect(new Date(historyData.emailSentAt)).toStrictEqual(history.emailSentAt);
            expect(historyData.emailSentTo).toStrictEqual(history.emailSentTo);
            expect(historyData.tenantId).toStrictEqual(history.tenantId);
            expect(historyData.weekOfYear).toStrictEqual(history.weekOfYear);
        });
        it('Should throw an error when mandatory fields are missing', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const rehRepository = new recurringEmailsHistoryRepository_1.default(mockIRepositoryOptions);
            await expect(() => rehRepository.create({
                emailSentAt: '2023-01-02T00:00:00Z',
                emailSentTo: ['anil@gitmesh.dev', 'uros@gitmesh.dev'],
                tenantId: mockIRepositoryOptions.currentTenant.id,
                type: undefined,
            })).rejects.toThrowError();
            await expect(() => rehRepository.create({
                emailSentAt: undefined,
                emailSentTo: ['anil@gitmesh.dev', 'uros@gitmesh.dev'],
                tenantId: mockIRepositoryOptions.currentTenant.id,
                weekOfYear: '1',
                type: recurringEmailsHistoryTypes_1.RecurringEmailType.WEEKLY_ANALYTICS,
            })).rejects.toThrowError();
            await expect(() => rehRepository.create({
                emailSentAt: '2023-01-02T00:00:00Z',
                emailSentTo: undefined,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                weekOfYear: '1',
                type: recurringEmailsHistoryTypes_1.RecurringEmailType.WEEKLY_ANALYTICS,
            })).rejects.toThrowError();
            await expect(() => rehRepository.create({
                emailSentAt: '2023-01-02T00:00:00Z',
                emailSentTo: ['anil@gitmesh.dev', 'uros@gitmesh.dev'],
                tenantId: undefined,
                weekOfYear: '1',
                type: recurringEmailsHistoryTypes_1.RecurringEmailType.WEEKLY_ANALYTICS,
            })).rejects.toThrowError();
        });
    });
    describe('findById method', () => {
        it('Should find historical receipt by id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const historyData = {
                emailSentAt: '2023-01-02T00:00:00Z',
                emailSentTo: ['anil@gitmesh.dev', 'uros@gitmesh.dev'],
                tenantId: mockIRepositoryOptions.currentTenant.id,
                weekOfYear: '1',
                type: recurringEmailsHistoryTypes_1.RecurringEmailType.WEEKLY_ANALYTICS,
            };
            const rehRepository = new recurringEmailsHistoryRepository_1.default(mockIRepositoryOptions);
            const receiptCreated = await rehRepository.create(historyData);
            const receiptFoundById = await rehRepository.findById(receiptCreated.id);
            expect(receiptFoundById).toStrictEqual(receiptCreated);
        });
        it('Should return null for non-existing receipt entry', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const rehRepository = new recurringEmailsHistoryRepository_1.default(mockIRepositoryOptions);
            const cache = await rehRepository.findById((0, crypto_1.randomUUID)());
            expect(cache).toBeNull();
        });
    });
    describe('findByWeekOfYear method', () => {
        it('Should find historical receipt by week of year', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const historyData = {
                emailSentAt: '2023-01-02T00:00:00Z',
                emailSentTo: ['anil@gitmesh.dev', 'uros@gitmesh.dev'],
                tenantId: mockIRepositoryOptions.currentTenant.id,
                weekOfYear: '1',
                type: recurringEmailsHistoryTypes_1.RecurringEmailType.SIGNALS_DIGEST,
            };
            const rehRepository = new recurringEmailsHistoryRepository_1.default(mockIRepositoryOptions);
            const receiptCreated = await rehRepository.create(historyData);
            // should find recently created receipt
            let receiptFound = await rehRepository.findByWeekOfYear(mockIRepositoryOptions.currentTenant.id, '1', recurringEmailsHistoryTypes_1.RecurringEmailType.SIGNALS_DIGEST);
            expect(receiptCreated).toStrictEqual(receiptFound);
            // shouldn't find any receipts
            receiptFound = await rehRepository.findByWeekOfYear(mockIRepositoryOptions.currentTenant.id, '2', recurringEmailsHistoryTypes_1.RecurringEmailType.SIGNALS_DIGEST);
            expect(receiptFound).toBeNull();
        });
    });
});
//# sourceMappingURL=recurringEmailsHistoryRepository.test.js.map