"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const signalsActionRepository_1 = __importDefault(require("../database/repositories/signalsActionRepository"));
const signalsContentRepository_1 = __importDefault(require("../database/repositories/signalsContentRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const track_1 = __importDefault(require("../segment/track"));
class SignalsActionService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    async create(data, contentId) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        // find content
        const content = await signalsContentRepository_1.default.findById(contentId, Object.assign(Object.assign({}, this.options), { transaction }));
        if (!content) {
            throw new common_1.Error404(this.options.language, 'errors.signals.contentNotFound');
        }
        // Tracking here so we have access to url and platform
        (0, track_1.default)(`Signals post ${data.type === types_1.SignalsActionType.BOOKMARK ? 'bookmarked' : 'voted'}`, {
            type: data.type,
            url: content.url,
            platform: content.platform,
            action: 'create',
        }, Object.assign({}, this.options));
        const existingUserActions = content.actions.filter((a) => a.actionById === this.options.currentUser.id);
        const existingUserActionTypes = existingUserActions.map((a) => a.type);
        try {
            // check if already bookmarked - if yes ignore the new action and return existing
            if (data.type === types_1.SignalsActionType.BOOKMARK &&
                existingUserActionTypes.includes(types_1.SignalsActionType.BOOKMARK)) {
                return existingUserActions.find((a) => a.type === types_1.SignalsActionType.BOOKMARK);
            }
            // thumbs up and down should be mutually exclusive
            if (data.type === types_1.SignalsActionType.THUMBS_DOWN &&
                existingUserActionTypes.includes(types_1.SignalsActionType.THUMBS_UP)) {
                await signalsActionRepository_1.default.removeActionFromContent(types_1.SignalsActionType.THUMBS_UP, contentId, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            else if (data.type === types_1.SignalsActionType.THUMBS_UP &&
                existingUserActionTypes.includes(types_1.SignalsActionType.THUMBS_DOWN)) {
                await signalsActionRepository_1.default.removeActionFromContent(types_1.SignalsActionType.THUMBS_DOWN, contentId, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            // add new action
            const record = await signalsActionRepository_1.default.createActionForContent(data, contentId, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'SignalsContent');
            throw error;
        }
    }
    async destroy(id) {
        const action = await signalsActionRepository_1.default.findById(id, this.options);
        const contentId = action.contentId;
        await signalsActionRepository_1.default.destroy(id, this.options);
        // find content
        const content = await signalsContentRepository_1.default.findById(contentId, this.options);
        // if content no longer has any actions attached to it, also delete the content
        if (content.actions.length === 0) {
            await signalsContentRepository_1.default.destroy(contentId, this.options);
        }
        // Tracking here so we have access to url and platform
        (0, track_1.default)(`Signals post ${action.type === types_1.SignalsActionType.BOOKMARK ? 'bookmarked' : 'voted'}`, {
            type: action.type,
            url: content.url,
            platform: content.platform,
            action: 'destroy',
        }, Object.assign({}, this.options));
    }
}
exports.default = SignalsActionService;
//# sourceMappingURL=signalsActionService.js.map