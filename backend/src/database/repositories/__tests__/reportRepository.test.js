"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const reportRepository_1 = __importDefault(require("../reportRepository"));
const widgetRepository_1 = __importDefault(require("../widgetRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const db = null;
describe('ReportRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create a report succesfully with default values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const report2Add = { name: 'test-report' };
            const reportCreated = await reportRepository_1.default.create(report2Add, mockIRepositoryOptions);
            reportCreated.createdAt = reportCreated.createdAt.toISOString().split('T')[0];
            reportCreated.updatedAt = reportCreated.updatedAt.toISOString().split('T')[0];
            const reportExpected = {
                id: reportCreated.id,
                public: false,
                isTemplate: false,
                name: report2Add.name,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                widgets: [],
                viewedBy: [],
            };
            expect(reportCreated).toStrictEqual(reportExpected);
        });
        it('Should create a report succesfully with given values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const report2Add = {
                name: 'test-report',
                public: true,
            };
            const reportCreated = await reportRepository_1.default.create(report2Add, mockIRepositoryOptions);
            reportCreated.createdAt = reportCreated.createdAt.toISOString().split('T')[0];
            reportCreated.updatedAt = reportCreated.updatedAt.toISOString().split('T')[0];
            const reportExpected = {
                id: reportCreated.id,
                public: report2Add.public,
                name: report2Add.name,
                importHash: null,
                isTemplate: false,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                widgets: [],
                viewedBy: [],
            };
            expect(reportCreated).toStrictEqual(reportExpected);
        });
        it('Should create a report succesfully with given values and widgets', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            let widget1 = await widgetRepository_1.default.create({ type: 'test-type', title: 'Some line graph' }, mockIRepositoryOptions);
            let widget2 = await widgetRepository_1.default.create({ type: 'test-type-2', title: 'Some bar graph' }, mockIRepositoryOptions);
            let widget3 = await widgetRepository_1.default.create({ type: 'test-type-3', title: 'Some area graph' }, mockIRepositoryOptions);
            const report2Add = {
                name: 'test-report',
                public: true,
                widgets: [widget1.id, widget2.id, widget3.id],
            };
            const reportCreated = await reportRepository_1.default.create(report2Add, mockIRepositoryOptions);
            reportCreated.widgets = reportCreated.widgets.map((i) => i.get({ plain: true }));
            widget1 = await widgetRepository_1.default.findById(widget1.id, mockIRepositoryOptions);
            widget2 = await widgetRepository_1.default.findById(widget2.id, mockIRepositoryOptions);
            widget3 = await widgetRepository_1.default.findById(widget3.id, mockIRepositoryOptions);
            // strip report object from widgets (only first layer associations are returned)
            const { report: _widget1Report } = widget1, widget1Raw = __rest(widget1, ["report"]);
            const { report: _widget2Report } = widget2, widget2Raw = __rest(widget2, ["report"]);
            const { report: _widget3Report } = widget3, widget3Raw = __rest(widget3, ["report"]);
            reportCreated.createdAt = reportCreated.createdAt.toISOString().split('T')[0];
            reportCreated.updatedAt = reportCreated.updatedAt.toISOString().split('T')[0];
            const reportExpected = {
                id: reportCreated.id,
                public: report2Add.public,
                name: report2Add.name,
                importHash: null,
                isTemplate: false,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                widgets: [widget1Raw, widget2Raw, widget3Raw],
                viewedBy: [],
            };
            expect(reportCreated).toStrictEqual(reportExpected);
        });
        it('Should throw sequelize not null error -- name field is required', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const report2Add = {};
            await expect(() => reportRepository_1.default.create(report2Add, mockIRepositoryOptions)).rejects.toThrow();
        });
    });
    describe('findById method', () => {
        it('Should successfully find created report by id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const report2Add = { name: 'test-report' };
            const reportCreated = await reportRepository_1.default.create(report2Add, mockIRepositoryOptions);
            reportCreated.createdAt = reportCreated.createdAt.toISOString().split('T')[0];
            reportCreated.updatedAt = reportCreated.updatedAt.toISOString().split('T')[0];
            const expectedReport = {
                id: reportCreated.id,
                public: false,
                name: report2Add.name,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                isTemplate: false,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                widgets: [],
                viewedBy: [],
            };
            const reportById = await reportRepository_1.default.findById(reportCreated.id, mockIRepositoryOptions);
            reportById.createdAt = reportById.createdAt.toISOString().split('T')[0];
            reportById.updatedAt = reportById.updatedAt.toISOString().split('T')[0];
            expect(reportById).toStrictEqual(expectedReport);
        });
        it('Should throw 404 error when no report found with given id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => reportRepository_1.default.findById(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('filterIdsInTenant method', () => {
        it('Should return the given ids of previously created report entities', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const report1 = {
                name: 'report-test-1',
                public: true,
            };
            const report2 = { name: 'report-test-2' };
            const report1Created = await reportRepository_1.default.create(report1, mockIRepositoryOptions);
            const report2Created = await reportRepository_1.default.create(report2, mockIRepositoryOptions);
            const filterIdsReturned = await reportRepository_1.default.filterIdsInTenant([report1Created.id, report2Created.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([report1Created.id, report2Created.id]);
        });
        it('Should only return the ids of previously created reports and filter random uuids out', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const report = { name: 'report-test' };
            const reportCreated = await reportRepository_1.default.create(report, mockIRepositoryOptions);
            const { randomUUID } = require('crypto');
            const filterIdsReturned = await reportRepository_1.default.filterIdsInTenant([reportCreated.id, randomUUID(), randomUUID()], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([reportCreated.id]);
        });
        it('Should return an empty array for an irrelevant tenant', async () => {
            let mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const report = { name: 'report-test' };
            const reportCreated = await reportRepository_1.default.create(report, mockIRepositoryOptions);
            // create a new tenant and bind options to it
            mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const filterIdsReturned = await reportRepository_1.default.filterIdsInTenant([reportCreated.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([]);
        });
    });
    describe('findAndCountAll method', () => {
        it('Should find and count all reports, with various filters', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const report1 = await reportRepository_1.default.create({ name: 'test-report-1', public: true, isTemplate: false }, mockIRepositoryOptions);
            await new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
            const report2 = await reportRepository_1.default.create({ name: 'test-report-2', public: false, isTemplate: true }, mockIRepositoryOptions);
            await new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
            const report3 = await reportRepository_1.default.create({ name: 'another-report', public: false, isTemplate: true }, mockIRepositoryOptions);
            // Filter by name
            let reports = await reportRepository_1.default.findAndCountAll({ filter: { name: 'test-report' } }, mockIRepositoryOptions);
            expect(reports.count).toEqual(2);
            expect(reports.rows).toStrictEqual([report2, report1]);
            // Filter by id
            reports = await reportRepository_1.default.findAndCountAll({ filter: { id: report3.id } }, mockIRepositoryOptions);
            expect(reports.count).toEqual(1);
            expect(reports.rows).toStrictEqual([report3]);
            // filter by public
            reports = await reportRepository_1.default.findAndCountAll({ filter: { public: false } }, mockIRepositoryOptions);
            expect(reports.count).toEqual(2);
            expect(reports.rows).toStrictEqual([report3, report2]);
            // Filter by createdAt - find all between report1.createdAt and report3.createdAt
            reports = await reportRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [report1.createdAt, report3.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(reports.count).toEqual(3);
            expect(reports.rows).toStrictEqual([report3, report2, report1]);
            // Filter by createdAt - find all where createdAt < report2.createdAt
            reports = await reportRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [null, report2.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(reports.count).toEqual(2);
            expect(reports.rows).toStrictEqual([report2, report1]);
            // Filter by createdAt - find all where createdAt < report1.createdAt
            reports = await reportRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [null, report1.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(reports.count).toEqual(1);
            expect(reports.rows).toStrictEqual([report1]);
            // filter by isTemplate
            reports = await reportRepository_1.default.findAndCountAll({ filter: { isTemplate: false } }, mockIRepositoryOptions);
            expect(reports.count).toEqual(1);
            expect(reports.rows).toStrictEqual([report1]);
        });
    });
    describe('update method', () => {
        it('Should succesfully update previously created report', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const report = await reportRepository_1.default.create({ name: 'test-report' }, mockIRepositoryOptions);
            let widget = await widgetRepository_1.default.create({ type: 'widget-test' }, mockIRepositoryOptions);
            const reportUpdated = await reportRepository_1.default.update(report.id, {
                name: 'updated-report-name',
                public: true,
                widgets: [widget.id],
            }, mockIRepositoryOptions);
            // Check updatedat is updated correctly
            expect(reportUpdated.updatedAt.getTime()).toBeGreaterThan(reportUpdated.createdAt.getTime());
            reportUpdated.widgets = reportUpdated.widgets.map((i) => i.get({ plain: true }));
            widget = await widgetRepository_1.default.findById(widget.id, mockIRepositoryOptions);
            const { report: _widget1Report } = widget, widgetRaw = __rest(widget, ["report"]);
            const reportExpected = {
                id: report.id,
                public: reportUpdated.public,
                name: reportUpdated.name,
                importHash: null,
                createdAt: report.createdAt,
                updatedAt: reportUpdated.updatedAt,
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                widgets: [widgetRaw],
                isTemplate: false,
                viewedBy: [],
            };
            expect(reportUpdated).toStrictEqual(reportExpected);
        });
        it('Should throw 404 error when trying to update non existent report', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => reportRepository_1.default.update(randomUUID(), { type: 'non-existent' }, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('destroy method', () => {
        it('Should succesfully destroy previously created report and its widgets', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const widget = await widgetRepository_1.default.create({ type: 'widget-test' }, mockIRepositoryOptions);
            const report = await reportRepository_1.default.create({
                name: 'test-report',
                public: true,
                widgets: [widget.id],
            }, mockIRepositoryOptions);
            await reportRepository_1.default.destroy(report.id, mockIRepositoryOptions, true);
            // Try selecting both report and its widget after destroy, should throw 404
            await expect(() => reportRepository_1.default.findById(report.id, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
            await expect(() => widgetRepository_1.default.findById(widget.id, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
        it('Should throw 404 when trying to destroy a non existent report', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => reportRepository_1.default.destroy(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
});
//# sourceMappingURL=reportRepository.test.js.map