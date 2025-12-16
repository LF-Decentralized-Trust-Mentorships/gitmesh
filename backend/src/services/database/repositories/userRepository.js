"use strict";
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
var crypto_1 = __importDefault(require("crypto"));
var sequelize_1 = __importDefault(require("sequelize"));
var lodash_1 = __importDefault(require("lodash"));
var common_1 = require("@gitmesh/common");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
var userTenantUtils_1 = require("../utils/userTenantUtils");
var sequelizeArrayUtils_1 = __importDefault(require("../utils/sequelizeArrayUtils"));
var Op = sequelize_1["default"].Op;
var UserRepository = /** @class */ (function () {
    function UserRepository() {
    }
    /**
     * Finds the user that owns the given tenant
     * @param tenantId
     * @returns User object with tenants populated
     */
    UserRepository.findUserOfTenant = function (tenantId) {
        return __awaiter(this, void 0, void 0, function () {
            var options, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeRepository_1["default"].getDefaultIRepositoryOptions()];
                    case 1:
                        options = _a.sent();
                        return [4 /*yield*/, options.database.user.findOne({
                                tenants: tenantId
                            })];
                    case 2:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [2 /*return*/, this._populateRelations(record, options)];
                }
            });
        });
    };
    /**
     * Finds all users of a tenant.
     * @param tenantId
     * @returns
     */
    UserRepository.findAllUsersOfTenant = function (tenantId) {
        return __awaiter(this, void 0, void 0, function () {
            var options, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeRepository_1["default"].getDefaultIRepositoryOptions()];
                    case 1:
                        options = _a.sent();
                        return [4 /*yield*/, options.database.user.findAll({
                                include: [
                                    {
                                        model: options.database.tenantUser,
                                        as: 'tenants',
                                        where: { tenantId: tenantId }
                                    },
                                ]
                            })];
                    case 2:
                        records = _a.sent();
                        if (records.length === 0) {
                            throw new common_1.Error404();
                        }
                        return [2 /*return*/, this._populateRelationsForRows(records, options)];
                }
            });
        });
    };
    UserRepository.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.create({
                                id: data.id || undefined,
                                email: data.email,
                                firstName: data.firstName || null,
                                lastName: data.lastName || null,
                                phoneNumber: data.phoneNumber || null,
                                importHash: data.importHash || null,
                                createdById: currentUser.id,
                                updatedById: currentUser.id
                            }, { transaction: transaction })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'user',
                                entityId: user.id,
                                action: auditLogRepository_1["default"].CREATE,
                                values: __assign(__assign({}, user.get({ plain: true })), { avatars: data.avatars })
                            }, options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.findById(user.id, __assign(__assign({}, options), { bypassPermissionValidation: true }))];
                }
            });
        });
    };
    UserRepository.createFromAuth = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.create({
                                email: data.email,
                                firstName: data.firstName,
                                lastName: data.lastName,
                                fullName: data.fullName,
                                password: data.password,
                                acceptedTermsAndPrivacy: data.acceptedTermsAndPrivacy
                            }, { transaction: transaction })];
                    case 1:
                        user = _a.sent();
                        delete user.password;
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'user',
                                entityId: user.id,
                                action: auditLogRepository_1["default"].CREATE,
                                values: __assign(__assign({}, user.get({ plain: true })), { avatars: data.avatars })
                            }, options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.findById(user.id, __assign(__assign({}, options), { bypassPermissionValidation: true }))];
                }
            });
        });
    };
    UserRepository.updateProfile = function (id, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findByPk(id, {
                                transaction: transaction
                            })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, user.update({
                                firstName: data.firstName || null,
                                lastName: data.lastName || null,
                                phoneNumber: data.phoneNumber || null,
                                acceptedTermsAndPrivacy: data.acceptedTermsAndPrivacy || false,
                                updatedById: currentUser.id
                            }, { transaction: transaction })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'user',
                                entityId: user.id,
                                action: auditLogRepository_1["default"].UPDATE,
                                values: __assign(__assign({}, user.get({ plain: true })), { avatars: data.avatars })
                            }, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(user.id, options)];
                }
            });
        });
    };
    UserRepository.updatePassword = function (id, password, invalidateOldTokens, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, user, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findByPk(id, {
                                transaction: transaction
                            })];
                    case 1:
                        user = _a.sent();
                        data = {
                            password: password,
                            updatedById: currentUser.id
                        };
                        if (invalidateOldTokens) {
                            data.jwtTokenInvalidBefore = new Date();
                        }
                        return [4 /*yield*/, user.update(data, { transaction: transaction })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'user',
                                entityId: user.id,
                                action: auditLogRepository_1["default"].UPDATE,
                                values: {
                                    id: id
                                }
                            }, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(user.id, __assign(__assign({}, options), { bypassPermissionValidation: true }))];
                }
            });
        });
    };
    UserRepository.generateEmailVerificationToken = function (email, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, user, emailVerificationToken, emailVerificationTokenExpiresAt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findOne({
                                where: { email: email },
                                transaction: transaction
                            })];
                    case 1:
                        user = _a.sent();
                        emailVerificationToken = crypto_1["default"].randomBytes(20).toString('hex');
                        emailVerificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
                        return [4 /*yield*/, user.update({
                                emailVerificationToken: emailVerificationToken,
                                emailVerificationTokenExpiresAt: emailVerificationTokenExpiresAt,
                                updatedById: currentUser.id
                            }, { transaction: transaction })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'user',
                                entityId: user.id,
                                action: auditLogRepository_1["default"].UPDATE,
                                values: {
                                    id: user.id,
                                    emailVerificationToken: emailVerificationToken,
                                    emailVerificationTokenExpiresAt: emailVerificationTokenExpiresAt
                                }
                            }, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, emailVerificationToken];
                }
            });
        });
    };
    UserRepository.generatePasswordResetToken = function (email, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, user, passwordResetToken, passwordResetTokenExpiresAt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findOne({
                                where: { email: email },
                                transaction: transaction
                            })];
                    case 1:
                        user = _a.sent();
                        passwordResetToken = crypto_1["default"].randomBytes(20).toString('hex');
                        passwordResetTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
                        return [4 /*yield*/, user.update({
                                passwordResetToken: passwordResetToken,
                                passwordResetTokenExpiresAt: passwordResetTokenExpiresAt,
                                updatedById: currentUser.id
                            }, { transaction: transaction })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'user',
                                entityId: user.id,
                                action: auditLogRepository_1["default"].UPDATE,
                                values: {
                                    id: user.id,
                                    passwordResetToken: passwordResetToken,
                                    passwordResetTokenExpiresAt: passwordResetTokenExpiresAt
                                }
                            }, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, passwordResetToken];
                }
            });
        });
    };
    UserRepository.update = function (id, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findByPk(id, {
                                transaction: transaction
                            })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, user.update({
                                firstName: data.firstName || null,
                                lastName: data.lastName || null,
                                phoneNumber: data.phoneNumber || null,
                                provider: data.provider || null,
                                providerId: data.providerId || null,
                                emailVerified: data.emailVerified || null,
                                updatedById: currentUser.id
                            }, { transaction: transaction })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'user',
                                entityId: user.id,
                                action: auditLogRepository_1["default"].UPDATE,
                                values: __assign(__assign({}, user.get({ plain: true })), { avatars: data.avatars, roles: data.roles })
                            }, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(user.id, options)];
                }
            });
        });
    };
    UserRepository.findByEmail = function (email, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findOne({
                                where: (_a = {},
                                    _a[Op.and] = sequelizeFilterUtils_1["default"].ilikeExact('user', 'email', email),
                                    _a),
                                transaction: transaction
                            })];
                    case 1:
                        record = _b.sent();
                        return [2 /*return*/, this._populateRelations(record, options)];
                }
            });
        });
    };
    UserRepository.findByEmailWithoutAvatar = function (email, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findOne({
                                where: (_a = {},
                                    _a[Op.and] = sequelizeFilterUtils_1["default"].ilikeExact('user', 'email', email),
                                    _a),
                                transaction: transaction
                            })];
                    case 1:
                        record = _b.sent();
                        return [2 /*return*/, this._populateRelations(record, options)];
                }
            });
        });
    };
    UserRepository.findAndCountAll = function (_a, options) {
        var filter = _a.filter, _b = _a.limit, limit = _b === void 0 ? 0 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c, _d = _a.orderBy, orderBy = _d === void 0 ? '' : _d;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, whereAnd, include, currentTenant, innerWhereAnd, _e, start, end, where, _f, rows, count;
            var _g, _h, _j, _k, _l;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        whereAnd = [];
                        include = [];
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        if (!filter || (!filter.role && !filter.status)) {
                            include.push({
                                model: options.database.tenantUser,
                                as: 'tenants',
                                where: {
                                    tenantId: currentTenant.id
                                }
                            });
                        }
                        // Exclude support@gitmesh.dev
                        whereAnd.push({
                            email: (_g = {},
                                _g[Op.ne] = 'support@gitmesh.dev',
                                _g)
                        });
                        if (filter) {
                            if (filter.id) {
                                whereAnd.push({
                                    id: filter.id
                                });
                            }
                            if (filter.fullName) {
                                whereAnd.push(sequelizeFilterUtils_1["default"].ilikeIncludes('user', 'fullName', filter.fullName));
                            }
                            if (filter.email) {
                                whereAnd.push(sequelizeFilterUtils_1["default"].ilikeIncludes('user', 'email', filter.email));
                            }
                            if (filter.role) {
                                innerWhereAnd = [];
                                innerWhereAnd.push({
                                    tenantId: currentTenant.id
                                });
                                innerWhereAnd.push(sequelizeArrayUtils_1["default"].filter("tenants", "roles", filter.role));
                                include.push({
                                    model: options.database.tenantUser,
                                    as: 'tenants',
                                    where: (_h = {}, _h[Op.and] = innerWhereAnd, _h)
                                });
                            }
                            if (filter.status) {
                                include.push({
                                    model: options.database.tenantUser,
                                    as: 'tenants',
                                    where: {
                                        tenantId: currentTenant.id,
                                        status: filter.status
                                    }
                                });
                            }
                            if (filter.createdAtRange) {
                                _e = filter.createdAtRange, start = _e[0], end = _e[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    whereAnd.push({
                                        createdAt: (_j = {},
                                            _j[Op.gte] = start,
                                            _j)
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    whereAnd.push({
                                        createdAt: (_k = {},
                                            _k[Op.lte] = end,
                                            _k)
                                    });
                                }
                            }
                        }
                        where = (_l = {}, _l[Op.and] = whereAnd, _l);
                        return [4 /*yield*/, options.database.user.findAndCountAll({
                                where: where,
                                include: include,
                                limit: limit ? Number(limit) : undefined,
                                offset: offset ? Number(offset) : undefined,
                                order: orderBy ? [orderBy.split('_')] : [['email', 'ASC']],
                                transaction: transaction
                            })];
                    case 1:
                        _f = _m.sent(), rows = _f.rows, count = _f.count;
                        return [4 /*yield*/, this._populateRelationsForRows(rows, options)];
                    case 2:
                        rows = _m.sent();
                        rows = this._mapUserForTenantForRows(rows, currentTenant);
                        return [2 /*return*/, { rows: rows, count: count, limit: false, offset: 0 }];
                }
            });
        });
    };
    UserRepository.findAllAutocomplete = function (query, limit, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTenant, whereAnd, include, where, users, buildText;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        whereAnd = [];
                        include = [
                            {
                                model: options.database.tenantUser,
                                as: 'tenants',
                                where: {
                                    tenantId: currentTenant.id
                                }
                            },
                        ];
                        whereAnd.push({
                            email: (_a = {},
                                _a[Op.ne] = 'support@gitmesh.dev',
                                _a)
                        });
                        if (query) {
                            whereAnd.push((_b = {},
                                _b[Op.or] = [
                                    {
                                        id: sequelizeFilterUtils_1["default"].uuid(query)
                                    },
                                    sequelizeFilterUtils_1["default"].ilikeIncludes('user', 'fullName', query),
                                    sequelizeFilterUtils_1["default"].ilikeIncludes('user', 'email', query),
                                ],
                                _b));
                        }
                        where = (_c = {}, _c[Op.and] = whereAnd, _c);
                        return [4 /*yield*/, options.database.user.findAll({
                                attributes: ['id', 'fullName', 'email'],
                                where: where,
                                include: include,
                                limit: limit ? Number(limit) : undefined,
                                order: [['fullName', 'ASC']]
                            })];
                    case 1:
                        users = _d.sent();
                        users = this._mapUserForTenantForRows(users, currentTenant);
                        buildText = function (user) {
                            if (!user.fullName) {
                                return user.email.split('@')[0];
                            }
                            return "".concat(user.fullName);
                        };
                        return [2 /*return*/, users.map(function (user) { return ({
                                id: user.id,
                                label: buildText(user)
                            }); })];
                }
            });
        });
    };
    UserRepository.findById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record, currentTenant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.sequelize.query("\n        SELECT\n          \"id\",\n          ROW_TO_JSON(users) AS json\n        FROM users\n        WHERE \"deletedAt\" IS NULL\n          AND \"id\" = :id;\n      ", {
                                replacements: { id: id },
                                transaction: transaction,
                                model: options.database.user,
                                mapToModel: true
                            })];
                    case 1:
                        record = _a.sent();
                        record = record[0];
                        return [4 /*yield*/, this._populateRelations(record, options, {
                                where: {
                                    status: 'active'
                                }
                            })];
                    case 2:
                        record = _a.sent();
                        record = __assign(__assign({}, record), record.json);
                        delete record.json;
                        // Remove sensitive fields
                        delete record.password;
                        delete record.emailVerificationToken;
                        delete record.emailVerificationTokenExpiresAt;
                        delete record.providerId;
                        delete record.passwordResetToken;
                        delete record.passwordResetTokenExpiresAt;
                        delete record.jwtTokenInvalidBefore;
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        if (!options || !options.bypassPermissionValidation) {
                            if (!(0, userTenantUtils_1.isUserInTenant)(record, currentTenant)) {
                                throw new common_1.Error404();
                            }
                            record = this._mapUserForTenant(record, currentTenant);
                        }
                        return [2 /*return*/, record];
                }
            });
        });
    };
    UserRepository.findByIdWithoutAvatar = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record, currentTenant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findByPk(id, {
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, this._populateRelations(record, options)];
                    case 2:
                        record = _a.sent();
                        if (!options || !options.bypassPermissionValidation) {
                            if (!(0, userTenantUtils_1.isUserInTenant)(record, currentTenant)) {
                                throw new common_1.Error404();
                            }
                        }
                        return [2 /*return*/, record];
                }
            });
        });
    };
    UserRepository.findByPasswordResetToken = function (token, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findOne({
                                where: {
                                    passwordResetToken: token,
                                    // Find only not expired tokens
                                    passwordResetTokenExpiresAt: (_a = {},
                                        _a[options.database.Sequelize.Op.gt] = Date.now(),
                                        _a)
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _b.sent();
                        return [2 /*return*/, this._populateRelations(record, options)];
                }
            });
        });
    };
    UserRepository.findByEmailVerificationToken = function (token, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findOne({
                                where: {
                                    emailVerificationToken: token,
                                    emailVerificationTokenExpiresAt: (_a = {},
                                        _a[options.database.Sequelize.Op.gt] = Date.now(),
                                        _a)
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _b.sent();
                        return [2 /*return*/, this._populateRelations(record, options)];
                }
            });
        });
    };
    UserRepository.markEmailVerified = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findByPk(id, {
                                transaction: transaction
                            })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, user.update({
                                emailVerified: true,
                                updatedById: currentUser.id
                            }, { transaction: transaction })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'user',
                                entityId: user.id,
                                action: auditLogRepository_1["default"].UPDATE,
                                values: {
                                    id: id,
                                    emailVerified: true
                                }
                            }, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    UserRepository.count = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                transaction = sequelizeRepository_1["default"].getTransaction(options);
                return [2 /*return*/, options.database.user.count({
                        where: filter,
                        transaction: transaction
                    })];
            });
        });
    };
    UserRepository.findPassword = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.findByPk(id, {
                                // raw is responsible
                                // for bringing the password
                                raw: true,
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, record.password];
                }
            });
        });
    };
    UserRepository.createFromSocial = function (provider, providerId, email, emailVerified, firstName, lastName, fullName, options) {
        return __awaiter(this, void 0, void 0, function () {
            var data, transaction, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {
                            email: email,
                            emailVerified: emailVerified,
                            providerId: providerId,
                            provider: provider,
                            firstName: firstName,
                            lastName: lastName,
                            fullName: fullName,
                            acceptedTermsAndPrivacy: false
                        };
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.user.create(data, {
                                transaction: transaction
                            })];
                    case 1:
                        user = _a.sent();
                        delete user.password;
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'user',
                                entityId: user.id,
                                action: auditLogRepository_1["default"].CREATE,
                                values: __assign({}, user.get({ plain: true }))
                            }, options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.findById(user.id, __assign(__assign({}, options), { bypassPermissionValidation: true }))];
                }
            });
        });
    };
    UserRepository.cleanupForRelationships = function (userOrUsers) {
        if (!userOrUsers) {
            return userOrUsers;
        }
        if (Array.isArray(userOrUsers)) {
            return userOrUsers.map(function (user) { return lodash_1["default"].pick(user, ['id', 'firstName', 'lastName', 'email']); });
        }
        return lodash_1["default"].pick(userOrUsers, ['id', 'firstName', 'lastName', 'email']);
    };
    UserRepository.filterIdInTenant = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = lodash_1["default"]).get;
                        return [4 /*yield*/, this.filterIdsInTenant([id], options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), '[0]', null])];
                }
            });
        });
    };
    UserRepository.filterIdsInTenant = function (ids, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTenant, where, include, records;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ids || !ids.length) {
                            return [2 /*return*/, []];
                        }
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        where = {
                            id: (_a = {},
                                _a[Op["in"]] = ids,
                                _a)
                        };
                        include = [
                            {
                                model: options.database.tenantUser,
                                as: 'tenants',
                                where: {
                                    tenantId: currentTenant.id
                                }
                            },
                        ];
                        return [4 /*yield*/, options.database.user.findAll({
                                attributes: ['id'],
                                where: where,
                                include: include
                            })];
                    case 1:
                        records = _b.sent();
                        return [2 /*return*/, records.map(function (record) { return record.id; })];
                }
            });
        });
    };
    UserRepository._populateRelationsForRows = function (rows, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!rows) {
                    return [2 /*return*/, rows];
                }
                return [2 /*return*/, Promise.all(rows.map(function (record) { return _this._populateRelations(record, options); }))];
            });
        });
    };
    UserRepository._populateRelations = function (record, options, filter) {
        if (filter === void 0) { filter = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var output, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!record) {
                            return [2 /*return*/, record];
                        }
                        output = record.get({ plain: true });
                        _a = output;
                        return [4 /*yield*/, record.getTenants(__assign(__assign({}, filter), { include: [
                                    {
                                        model: options.database.tenant,
                                        as: 'tenant',
                                        required: true,
                                        include: ['settings']
                                    },
                                ], transaction: sequelizeRepository_1["default"].getTransaction(options) }))];
                    case 1:
                        _a.tenants = _b.sent();
                        return [2 /*return*/, output];
                }
            });
        });
    };
    /**
     * Maps the users data to show only the current tenant related info
     */
    UserRepository._mapUserForTenantForRows = function (rows, tenant) {
        var _this = this;
        if (!rows) {
            return rows;
        }
        return rows.map(function (record) { return _this._mapUserForTenant(record, tenant); });
    };
    /**
     * Maps the user data to show only the current tenant related info
     */
    UserRepository._mapUserForTenant = function (user, tenant) {
        if (!user || !user.tenants) {
            return user;
        }
        var tenantUser = user.tenants.find(function (tenantUser) {
            return tenantUser && tenantUser.tenant && String(tenantUser.tenant.id) === String(tenant.id);
        });
        delete user.tenants;
        var status = tenantUser ? tenantUser.status : null;
        var roles = tenantUser ? tenantUser.roles : [];
        // If the user is only invited,
        // tenant members can only see its email
        var otherData = status === 'active' ? user : {};
        return __assign(__assign({}, otherData), { id: user.id, email: user.email, fullName: user.fullName, roles: roles, status: status, invitationToken: tenantUser === null || tenantUser === void 0 ? void 0 : tenantUser.invitationToken });
    };
    return UserRepository;
}());
exports["default"] = UserRepository;
