"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var lodash_1 = __importDefault(require("lodash"));
var uuid_1 = require("uuid");
var sequelize_1 = require("sequelize");
var integrations_1 = require("@gitmesh/integrations");
var types_1 = require("@gitmesh/types");
var common_1 = require("@gitmesh/common");
var repositoryBase_1 = require("./repositoryBase");
var getObjectWithoutKey_1 = __importDefault(require("../../utils/getObjectWithoutKey"));
var integrationRepository_1 = __importDefault(require("./integrationRepository"));
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var SegmentRepository = /** @class */ (function (_super) {
    __extends(SegmentRepository, _super);
    function SegmentRepository(options) {
        return _super.call(this, options, true) || this;
    }
    /**
     * Insert a segment.
     * @param data segment data
     * @returns
     */
    SegmentRepository.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, segmentInsertResult, segment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("INSERT INTO \"segments\" (\"id\", \"url\", \"name\", \"slug\", \"parentSlug\", \"grandparentSlug\", \"status\", \"parentName\", \"sourceId\", \"sourceParentId\", \"tenantId\", \"grandparentName\")\n          VALUES\n              (:id, :url, :name, :slug, :parentSlug, :grandparentSlug, :status, :parentName, :sourceId, :sourceParentId, :tenantId, :grandparentName)\n          RETURNING \"id\"\n        ", {
                                replacements: {
                                    id: (0, uuid_1.v4)(),
                                    url: data.url || null,
                                    name: data.name,
                                    parentName: data.parentName || null,
                                    grandparentName: data.grandparentName || null,
                                    slug: data.slug,
                                    parentSlug: data.parentSlug || null,
                                    grandparentSlug: data.grandparentSlug || null,
                                    status: data.status || types_1.SegmentStatus.ACTIVE,
                                    sourceId: data.sourceId || null,
                                    sourceParentId: data.sourceParentId || null,
                                    tenantId: this.options.currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 1:
                        segmentInsertResult = _a.sent();
                        return [4 /*yield*/, this.findById(segmentInsertResult[0][0].id)];
                    case 2:
                        segment = _a.sent();
                        return [2 /*return*/, segment];
                }
            });
        });
    };
    /**
     * Updates:
     * parent slugs of children => parentSlug, grandparentSlug
     * parent names of children => parentName, grandparentName
     * @param id
     * @param slug
     * @param name
     */
    SegmentRepository.prototype.updateChildrenBulk = function (segment, data) {
        return __awaiter(this, void 0, void 0, function () {
            var subprojectIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!SegmentRepository.isProjectGroup(segment)) return [3 /*break*/, 3];
                        // update projects
                        return [4 /*yield*/, this.updateBulk(segment.projects.map(function (p) { return p.id; }), {
                                parentName: data.name,
                                parentSlug: data.slug
                            })];
                    case 1:
                        // update projects
                        _a.sent();
                        subprojectIds = segment.projects.reduce(function (acc, p) {
                            acc.push.apply(acc, p.subprojects.map(function (sp) { return sp.id; }));
                            return acc;
                        }, []);
                        return [4 /*yield*/, this.updateBulk(subprojectIds, {
                                grandparentSlug: data.slug,
                                grandparentName: data.name
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!SegmentRepository.isProject(segment)) return [3 /*break*/, 5];
                        // update subprojects
                        return [4 /*yield*/, this.updateBulk(segment.subprojects.map(function (sp) { return sp.id; }), {
                                parentName: data.name,
                                parentSlug: data.slug
                            })];
                    case 4:
                        // update subprojects
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, this.findById(segment.id)];
                }
            });
        });
    };
    SegmentRepository.prototype.updateBulk = function (ids, data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, updateFields, segmentUpdateQuery, replacements, _i, updateFields_1, field, idsUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        updateFields = Object.keys(data).filter(function (key) {
                            return data[key] &&
                                [
                                    'name',
                                    'slug',
                                    'parentSlug',
                                    'grandparentSlug',
                                    'status',
                                    'parentName',
                                    'sourceId',
                                    'sourceParentId',
                                    'grandparentName',
                                ].includes(key);
                        });
                        segmentUpdateQuery = "UPDATE segments SET ";
                        replacements = {};
                        for (_i = 0, updateFields_1 = updateFields; _i < updateFields_1.length; _i++) {
                            field = updateFields_1[_i];
                            segmentUpdateQuery += " \"".concat(field, "\" = :").concat(field, " ");
                            replacements[field] = data[field];
                            if (updateFields[updateFields.length - 1] !== field) {
                                segmentUpdateQuery += ', ';
                            }
                        }
                        segmentUpdateQuery += " WHERE id in (:ids) and \"tenantId\" = :tenantId returning id";
                        replacements.tenantId = this.options.currentTenant.id;
                        replacements.ids = ids;
                        return [4 /*yield*/, this.options.database.sequelize.query(segmentUpdateQuery, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 1:
                        idsUpdated = _a.sent();
                        return [2 /*return*/, idsUpdated];
                }
            });
        });
    };
    SegmentRepository.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, segment, updateFields, segmentUpdateQuery, replacements, _i, updateFields_2, field;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        segment = _a.sent();
                        if (!segment) {
                            throw new common_1.Error404();
                        }
                        updateFields = Object.keys(data).filter(function (key) {
                            return [
                                'name',
                                'url',
                                'slug',
                                'parentSlug',
                                'grandparentSlug',
                                'status',
                                'parentName',
                                'sourceId',
                                'sourceParentId',
                                'customActivityTypes',
                            ].includes(key);
                        });
                        if (!(updateFields.length > 0)) return [3 /*break*/, 3];
                        segmentUpdateQuery = "UPDATE segments SET ";
                        replacements = {};
                        for (_i = 0, updateFields_2 = updateFields; _i < updateFields_2.length; _i++) {
                            field = updateFields_2[_i];
                            segmentUpdateQuery += " \"".concat(field, "\" = :").concat(field, " ");
                            replacements[field] = data[field];
                            if (updateFields[updateFields.length - 1] !== field) {
                                segmentUpdateQuery += ', ';
                            }
                        }
                        segmentUpdateQuery += " WHERE id = :id and \"tenantId\" = :tenantId ";
                        replacements.tenantId = this.options.currentTenant.id;
                        replacements.id = id;
                        if (replacements.customActivityTypes) {
                            replacements.customActivityTypes = JSON.stringify(replacements.customActivityTypes);
                        }
                        return [4 /*yield*/, this.options.database.sequelize.query(segmentUpdateQuery, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, this.findById(id)];
                }
            });
        });
    };
    SegmentRepository.prototype.addActivityChannel = function (segmentId, platform, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("\n        INSERT INTO \"segmentActivityChannels\" (\"tenantId\", \"segmentId\", \"platform\", \"channel\")\n        VALUES (:tenantId, :segmentId, :platform, :channel)\n        ON CONFLICT DO NOTHING;\n      ", {
                                replacements: {
                                    tenantId: this.options.currentTenant.id,
                                    segmentId: segmentId,
                                    platform: platform,
                                    channel: channel
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SegmentRepository.prototype.fetchActivityChannels = function (segmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("\n        SELECT\n          \"platform\",\n          json_agg(DISTINCT \"channel\") AS \"channels\"\n        FROM \"segmentActivityChannels\"\n        WHERE \"tenantId\" = :tenantId\n          AND \"segmentId\" = :segmentId\n        GROUP BY \"platform\";\n      ", {
                                replacements: {
                                    tenantId: this.options.currentTenant.id,
                                    segmentId: segmentId
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records.reduce(function (acc, r) {
                                acc[r.platform] = r.channels;
                                return acc;
                            }, {})];
                }
            });
        });
    };
    SegmentRepository.prototype.fetchTenantActivityChannels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("\n        SELECT\n          \"platform\",\n          json_agg(DISTINCT \"channel\") AS \"channels\"\n        FROM \"segmentActivityChannels\"\n        WHERE \"tenantId\" = :tenantId\n        GROUP BY \"platform\";\n      ", {
                                replacements: {
                                    tenantId: this.options.currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records.reduce(function (acc, r) {
                                acc[r.platform] = r.channels;
                                return acc;
                            }, {})];
                }
            });
        });
    };
    SegmentRepository.prototype.getChildrenOfProjectGroups = function (segment) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("\n          SELECT *\n          FROM segments s\n          WHERE (s.\"grandparentSlug\" = :slug OR\n                 (s.\"parentSlug\" = :slug AND s.\"grandparentSlug\" IS NULL))\n            AND s.\"tenantId\" = :tenantId\n          ORDER BY \"grandparentSlug\" DESC, \"parentSlug\" DESC, slug DESC;\n      ", {
                                replacements: {
                                    slug: segment.slug,
                                    tenantId: this.options.currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records];
                }
            });
        });
    };
    SegmentRepository.prototype.getChildrenOfProjects = function (segment) {
        return __awaiter(this, void 0, void 0, function () {
            var records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.options.database.sequelize.query("\n                select * from segments s\n                where s.\"parentSlug\" = :slug\n                  AND s.\"grandparentSlug\" = :parentSlug\n                and s.\"tenantId\" = :tenantId;\n            ", {
                            replacements: {
                                slug: segment.slug,
                                parentSlug: segment.parentSlug,
                                tenantId: this.options.currentTenant.id
                            },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records];
                }
            });
        });
    };
    SegmentRepository.prototype.findBySlug = function (slug, level) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, findBySlugQuery, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        findBySlugQuery = "SELECT * FROM segments WHERE slug = :slug AND \"tenantId\" = :tenantId";
                        if (level === types_1.SegmentLevel.SUB_PROJECT) {
                            findBySlugQuery += " and \"parentSlug\" is not null and \"grandparentSlug\" is not null";
                        }
                        else if (level === types_1.SegmentLevel.PROJECT) {
                            findBySlugQuery += " and \"parentSlug\" is not null and \"grandparentSlug\" is null";
                        }
                        else if (level === types_1.SegmentLevel.PROJECT_GROUP) {
                            findBySlugQuery += " and \"parentSlug\" is null and \"grandparentSlug\" is null";
                        }
                        return [4 /*yield*/, this.options.database.sequelize.query(findBySlugQuery, {
                                replacements: {
                                    slug: slug,
                                    tenantId: this.options.currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        if (records.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, this.findById(records[0].id)];
                }
            });
        });
    };
    SegmentRepository.prototype.findInIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (ids.length === 0) {
                            return [2 /*return*/, []];
                        }
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("\n        SELECT\n          s.*\n        FROM segments s\n        WHERE id in (:ids)\n        AND s.\"tenantId\" = :tenantId\n        GROUP BY s.id;\n      ", {
                                replacements: {
                                    ids: ids,
                                    tenantId: this.options.currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records.map(function (sr) { return SegmentRepository.populateRelations(sr); })];
                }
            });
        });
    };
    SegmentRepository.populateRelations = function (record) {
        var segmentData = __assign(__assign({}, record), { activityTypes: null });
        if (SegmentRepository.isSubproject(record)) {
            segmentData.activityTypes = SegmentRepository.buildActivityTypes(record);
        }
        return segmentData;
    };
    SegmentRepository.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records, record, children, projects, children;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("\n        SELECT\n          s.*\n        FROM segments s\n        WHERE s.id = :id\n        AND s.\"tenantId\" = :tenantId\n        GROUP BY s.id;\n      ", {
                                replacements: {
                                    id: id,
                                    tenantId: this.options.currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        if (records.length === 0) {
                            return [2 /*return*/, null];
                        }
                        record = records[0];
                        if (!SegmentRepository.isProjectGroup(record)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getChildrenOfProjectGroups(record)];
                    case 2:
                        children = _a.sent();
                        projects = children.reduce(function (acc, child) {
                            if (SegmentRepository.isProject(child)) {
                                acc.push(child);
                            }
                            else if (SegmentRepository.isSubproject(child)) {
                                // find project index
                                var projectIndex = acc.findIndex(function (project) { return project.slug === child.parentSlug; });
                                if (!acc[projectIndex].subprojects) {
                                    acc[projectIndex].subprojects = [child];
                                }
                                else {
                                    acc[projectIndex].subprojects.push(child);
                                }
                            }
                            return acc;
                        }, []);
                        record.projects = projects;
                        return [3 /*break*/, 5];
                    case 3:
                        if (!SegmentRepository.isProject(record)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getChildrenOfProjects(record)];
                    case 4:
                        children = _a.sent();
                        record.subprojects = children;
                        _a.label = 5;
                    case 5: return [2 /*return*/, SegmentRepository.populateRelations(record)];
                }
            });
        });
    };
    SegmentRepository.isProjectGroup = function (segment) {
        return segment.slug && segment.parentSlug === null && segment.grandparentSlug === null;
    };
    SegmentRepository.isProject = function (segment) {
        return segment.slug && segment.parentSlug && segment.grandparentSlug === null;
    };
    SegmentRepository.isSubproject = function (segment) {
        return segment.slug != null && segment.parentSlug != null && segment.grandparentSlug != null;
    };
    /**
     * Query project groups with their children
     * @returns
     */
    SegmentRepository.prototype.queryProjectGroups = function (criteria) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var searchQuery, projectGroups, count, rows;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        searchQuery = 'WHERE 1=1';
                        if ((_a = criteria.filter) === null || _a === void 0 ? void 0 : _a.status) {
                            searchQuery += "AND s.status = :status";
                        }
                        if ((_b = criteria.filter) === null || _b === void 0 ? void 0 : _b.name) {
                            searchQuery += "AND s.name ilike :name";
                        }
                        return [4 /*yield*/, this.options.database.sequelize.query("\n          WITH\n              foundations AS (\n                  SELECT\n                      f.id AS foundation_id,\n                      f.name AS foundation_name,\n                      f.status,\n                      f.\"createdAt\",\n                      f.\"updatedAt\",\n                      f.\"sourceId\",\n                      f.\"sourceParentId\",\n                      f.slug,\n                      p.name AS project_name,\n                      p.id AS project_id,\n                      p.status AS project_status,\n                      p.slug AS project_slug,\n                      COUNT(DISTINCT sp.id) AS subproject_count,\n                      JSONB_AGG(JSONB_BUILD_OBJECT(\n                          'id', sp.id,\n                          'name', sp.name,\n                          'status', sp.status,\n                          'slug', sp.slug\n                          )) AS subprojects\n                  FROM segments f\n                  JOIN segments p\n                      ON p.\"parentSlug\" = f.\"slug\"\n                             AND p.\"grandparentSlug\" IS NULL\n                             AND p.\"tenantId\" = f.\"tenantId\"\n                  JOIN segments sp\n                      ON sp.\"parentSlug\" = p.\"slug\"\n                             AND sp.\"grandparentSlug\" = f.slug\n                             AND sp.\"tenantId\" = f.\"tenantId\"\n                  WHERE f.\"parentSlug\" IS NULL\n                    AND f.\"tenantId\" = :tenantId\n                  GROUP BY f.\"id\", p.id\n              )\n          SELECT\n              s.*,\n              COUNT(*) OVER () AS \"totalCount\",\n              JSONB_AGG(JSONB_BUILD_OBJECT(\n                      'id', f.project_id,\n                      'name', f.project_name,\n                      'status', f.project_status,\n                      'slug', f.project_slug,\n                      'subprojects', f.subprojects\n                  )) AS projects\n          FROM segments s\n          JOIN foundations f ON s.id = f.foundation_id\n          ".concat(searchQuery, "\n          GROUP BY s.id, f.foundation_name\n          ORDER BY f.foundation_name\n          ").concat(this.getPaginationString(criteria), ";\n      "), {
                                replacements: {
                                    tenantId: this.currentTenant.id,
                                    name: "%".concat((_c = criteria.filter) === null || _c === void 0 ? void 0 : _c.name, "%"),
                                    status: (_d = criteria.filter) === null || _d === void 0 ? void 0 : _d.status
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        projectGroups = _e.sent();
                        count = projectGroups.length > 0 ? Number.parseInt(projectGroups[0].totalCount, 10) : 0;
                        rows = projectGroups.map(function (i) { return (0, getObjectWithoutKey_1["default"])(i, 'totalCount'); });
                        return [2 /*return*/, { count: count, rows: rows, limit: criteria.limit, offset: criteria.offset }];
                }
            });
        });
    };
    SegmentRepository.prototype.queryProjects = function (criteria) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var searchQuery, projects, subprojects, integrationsBySegments, count, rows;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        searchQuery = '';
                        if ((_a = criteria.filter) === null || _a === void 0 ? void 0 : _a.status) {
                            searchQuery += " AND s.status = :status";
                        }
                        if ((_b = criteria.filter) === null || _b === void 0 ? void 0 : _b.name) {
                            searchQuery += " AND s.name ilike :name";
                        }
                        if ((_c = criteria.filter) === null || _c === void 0 ? void 0 : _c.parentSlug) {
                            searchQuery += " AND s.\"parentSlug\" = :parent_slug ";
                        }
                        return [4 /*yield*/, this.options.database.sequelize.query("\n            SELECT \n                s.*,\n                COUNT(DISTINCT sp.id)                                       AS subproject_count,\n                jsonb_agg(jsonb_build_object('id', sp.id, 'name', sp.name, 'status', sp.status)) as subprojects,\n                count(*) over () as \"totalCount\"\n            FROM segments s\n                JOIN segments sp ON sp.\"parentSlug\" = s.\"slug\" and sp.\"grandparentSlug\" is not null\n                AND sp.\"tenantId\" = s.\"tenantId\"\n            WHERE \n                s.\"grandparentSlug\" IS NULL\n            and s.\"parentSlug\" is not null\n            and s.\"tenantId\" = :tenantId\n            ".concat(searchQuery, "\n            GROUP BY s.\"id\"\n            ORDER BY s.\"name\"\n            ").concat(this.getPaginationString(criteria), ";\n            "), {
                                replacements: {
                                    tenantId: this.currentTenant.id,
                                    name: "%".concat((_d = criteria.filter) === null || _d === void 0 ? void 0 : _d.name, "%"),
                                    status: (_e = criteria.filter) === null || _e === void 0 ? void 0 : _e.status,
                                    parent_slug: "".concat((_f = criteria.filter) === null || _f === void 0 ? void 0 : _f.parentSlug)
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        projects = _g.sent();
                        subprojects = projects.map(function (p) { return p.subprojects; }).flat();
                        return [4 /*yield*/, this.queryIntegrationsForSubprojects(subprojects)];
                    case 2:
                        integrationsBySegments = _g.sent();
                        count = projects.length > 0 ? Number.parseInt(projects[0].totalCount, 10) : 0;
                        rows = projects.map(function (i) { return (0, getObjectWithoutKey_1["default"])(i, 'totalCount'); });
                        // assign integrations to subprojects
                        rows.forEach(function (row) {
                            row.subprojects.forEach(function (subproject) {
                                subproject.integrations = integrationsBySegments[subproject.id] || [];
                            });
                        });
                        return [2 /*return*/, { count: count, rows: rows, limit: criteria.limit, offset: criteria.offset }];
                }
            });
        });
    };
    SegmentRepository.prototype.getDefaultSegment = function () {
        return __awaiter(this, void 0, void 0, function () {
            var segments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.querySubprojects({ limit: 1, offset: 0 })];
                    case 1:
                        segments = _a.sent();
                        return [2 /*return*/, segments.rows[0] || null];
                }
            });
        });
    };
    SegmentRepository.prototype.querySubprojects = function (criteria) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function () {
            var searchQuery, subprojects, rows;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        searchQuery = '';
                        if ((_a = criteria.filter) === null || _a === void 0 ? void 0 : _a.status) {
                            searchQuery += " AND s.status = :status";
                        }
                        if ((_b = criteria.filter) === null || _b === void 0 ? void 0 : _b.name) {
                            searchQuery += " AND s.name ilike :name";
                        }
                        if ((_c = criteria.filter) === null || _c === void 0 ? void 0 : _c.parentSlug) {
                            searchQuery += " AND s.\"parentSlug\" = :parent_slug ";
                        }
                        if ((_d = criteria.filter) === null || _d === void 0 ? void 0 : _d.grandparentSlug) {
                            searchQuery += " AND s.\"grandparentSlug\" = :grandparent_slug ";
                        }
                        return [4 /*yield*/, this.options.database.sequelize.query("\n        SELECT\n          s.*\n        FROM segments s\n        WHERE s.\"grandparentSlug\" IS NOT NULL\n          AND s.\"parentSlug\" IS NOT NULL\n          AND s.\"tenantId\" = :tenantId\n          ".concat(searchQuery, "\n        ORDER BY s.name\n        ").concat(this.getPaginationString(criteria), ";\n      "), {
                                replacements: {
                                    tenantId: this.currentTenant.id,
                                    name: "%".concat((_e = criteria.filter) === null || _e === void 0 ? void 0 : _e.name, "%"),
                                    status: (_f = criteria.filter) === null || _f === void 0 ? void 0 : _f.status,
                                    parent_slug: "".concat((_g = criteria.filter) === null || _g === void 0 ? void 0 : _g.parentSlug),
                                    grandparent_slug: "".concat((_h = criteria.filter) === null || _h === void 0 ? void 0 : _h.grandparentSlug)
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        subprojects = _j.sent();
                        rows = subprojects;
                        return [2 /*return*/, {
                                count: 1,
                                rows: rows.map(function (sr) { return SegmentRepository.populateRelations(sr); }),
                                limit: criteria.limit,
                                offset: criteria.offset
                            }];
                }
            });
        });
    };
    SegmentRepository.prototype.queryIntegrationsForSubprojects = function (subprojects) {
        return __awaiter(this, void 0, void 0, function () {
            var segmentIds, integrations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        segmentIds = subprojects.map(function (i) { return i.id; });
                        return [4 /*yield*/, integrationRepository_1["default"].findAndCountAll({
                                advancedFilter: {
                                    segmentId: segmentIds
                                }
                            }, __assign(__assign({}, this.options), { currentSegments: subprojects }))];
                    case 1:
                        integrations = (_a.sent()).rows;
                        integrations = integrations.map(function (_a) {
                            var platform = _a.platform, id = _a.id, status = _a.status, segmentId = _a.segmentId;
                            return ({
                                platform: platform,
                                id: id,
                                status: status,
                                segmentId: segmentId
                            });
                        });
                        return [2 /*return*/, lodash_1["default"].groupBy(integrations, 'segmentId')];
                }
            });
        });
    };
    /**
     * Builds activity types object with both default and custom activity types
     * @param record
     * @returns
     */
    SegmentRepository.buildActivityTypes = function (record) {
        var activityTypes = {};
        activityTypes["default"] = lodash_1["default"].cloneDeep(integrations_1.DEFAULT_ACTIVITY_TYPE_SETTINGS);
        activityTypes.custom = {};
        var customActivityTypes = record.customActivityTypes || {};
        if (Object.keys(customActivityTypes).length > 0) {
            activityTypes.custom = customActivityTypes;
        }
        return activityTypes;
    };
    SegmentRepository.getActivityTypes = function (options) {
        return options.currentSegments.reduce(function (acc, s) { return lodash_1["default"].merge(acc, s.activityTypes); }, {});
    };
    SegmentRepository.fetchTenantActivityTypes = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.sequelize.query("\n        SELECT\n            jsonb_merge_agg(s.\"customActivityTypes\") AS \"customActivityTypes\"\n        FROM segments s\n        WHERE s.\"grandparentSlug\" IS NOT NULL\n          AND s.\"parentSlug\" IS NOT NULL\n          AND s.\"tenantId\" = :tenantId\n          AND s.\"customActivityTypes\" != '{}'\n      ", {
                                replacements: {
                                    tenantId: options.currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        record = (_a.sent())[0];
                        return [2 /*return*/, SegmentRepository.buildActivityTypes(record)];
                }
            });
        });
    };
    SegmentRepository.activityTypeExists = function (platform, key, options) {
        var activityTypes = this.getActivityTypes(options);
        if ((activityTypes["default"][platform] && activityTypes["default"][platform][key]) ||
            (activityTypes.custom[platform] && activityTypes.custom[platform][key])) {
            return true;
        }
        return false;
    };
    return SegmentRepository;
}(repositoryBase_1.RepositoryBase));
exports["default"] = SegmentRepository;
