"use strict";
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
var sequelize_1 = require("sequelize");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var MemberAffiliationRepository = /** @class */ (function () {
    function MemberAffiliationRepository() {
    }
    MemberAffiliationRepository.update = function (memberId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        query = "\n      WITH new_activities_organizations AS (\n          SELECT\n              a.id,\n\n              -- this 000000 magic is to differentiate between nothing to LEFT JOIN with and real individial affiliation\n              -- we want to keep NULL in 'organizationId' if there is an affiliation configured,\n              -- but if there is no manual affiliation, we know this by 'msa.id' being NULL, and then using 000000 as a marker,\n              -- which we remove afterwards\n              (ARRAY_REMOVE(ARRAY_AGG(CASE WHEN msa.id IS NULL THEN '00000000-0000-0000-0000-000000000000' ELSE msa.\"organizationId\" END), '00000000-0000-0000-0000-000000000000')\n               || ARRAY_REMOVE(ARRAY_AGG(mo.\"organizationId\" ORDER BY mo.\"dateStart\" DESC, mo.id), NULL)\n               || ARRAY_REMOVE(ARRAY_AGG(mo1.\"organizationId\" ORDER BY mo1.\"createdAt\" DESC, mo1.id), NULL)\n               || ARRAY_REMOVE(ARRAY_AGG(mo2.\"organizationId\" ORDER BY mo2.\"createdAt\", mo2.id), NULL)\n              )[1] AS new_org\n          FROM activities a\n          LEFT JOIN \"memberSegmentAffiliations\" msa ON msa.\"memberId\" = a.\"memberId\" AND a.\"segmentId\" = msa.\"segmentId\" AND (\n                 a.timestamp BETWEEN msa.\"dateStart\" AND msa.\"dateEnd\"\n                 OR (a.timestamp >= msa.\"dateStart\" AND msa.\"dateEnd\" IS NULL)\n             )\n          LEFT JOIN \"memberOrganizations\" mo ON mo.\"memberId\" = a.\"memberId\"\n              AND (\n                  a.timestamp BETWEEN mo.\"dateStart\" AND mo.\"dateEnd\"\n                  OR (a.timestamp >= mo.\"dateStart\" AND mo.\"dateEnd\" IS NULL)\n              )\n              AND mo.\"deletedAt\" IS NULL\n          LEFT JOIN \"memberOrganizations\" mo1 ON mo1.\"memberId\" = a.\"memberId\"\n              AND mo1.\"dateStart\" IS NULL AND mo1.\"dateEnd\" IS NULL\n              AND mo1.\"createdAt\" <= a.timestamp\n              AND mo1.\"deletedAt\" IS NULL\n          LEFT JOIN \"memberOrganizations\" mo2 ON mo2.\"memberId\" = a.\"memberId\"\n              AND mo2.\"dateStart\" IS NULL AND mo2.\"dateEnd\" IS NULL\n              AND mo2.\"deletedAt\" IS NULL\n          WHERE a.\"memberId\" = :memberId\n          GROUP BY a.id\n      )\n      UPDATE activities a1\n      SET \"organizationId\" = nao.new_org\n      FROM new_activities_organizations nao\n      WHERE a1.id = nao.id\n        AND (\"organizationId\" != nao.new_org\n             OR (\"organizationId\" IS NULL AND nao.new_org IS NOT NULL)\n             OR (\"organizationId\" IS NOT NULL AND nao.new_org IS NULL))\n      RETURNING a1.id, a1.\"organizationId\", nao.new_org\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberId: memberId
                                },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MemberAffiliationRepository;
}());
exports["default"] = MemberAffiliationRepository;
