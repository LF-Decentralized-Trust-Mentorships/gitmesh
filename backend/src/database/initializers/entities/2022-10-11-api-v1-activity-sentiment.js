"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const common_1 = require("@gitmesh/common");
const activityService_1 = __importDefault(require("../../../services/activityService"));
const sequelizeRepository_1 = __importDefault(require("../../repositories/sequelizeRepository"));
/**
 * Since requests to aws activity sentiment api creates a bottleneck,
 * We'll be generating the sentiment for this month's activities only.
 * TODO:: Finish this up
 */
exports.default = async () => {
    const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    // const activityQuery = `select * from activities a where a."timestamp"  between '2022-09-01' and now() and (a."attributes"->>'sample') is null`
    const activityQuery = `select * from activities a where a."timestamp"  between '2022-09-01' and now() 
  and(a."attributes"->>'sample') is null
  and ((a.title is not null and a.title != '') or (a.body is not null and a.body != ''))`;
    let activities = await options.database.sequelize.query(activityQuery, {
        type: sequelize_1.QueryTypes.SELECT,
    });
    const splittedActivities = [];
    const ACTIVITY_CHUNK_SIZE = 350;
    if (activities.length > ACTIVITY_CHUNK_SIZE) {
        while (activities.length > ACTIVITY_CHUNK_SIZE) {
            splittedActivities.push(activities.slice(0, ACTIVITY_CHUNK_SIZE));
            activities = activities.slice(ACTIVITY_CHUNK_SIZE);
        }
        // insert last small chunk
        if (activities.length > 0)
            splittedActivities.push(activities);
    }
    else {
        splittedActivities.push(activities);
    }
    const activityService = new activityService_1.default(options);
    for (let activityChunk of splittedActivities) {
        let sentiments;
        try {
            sentiments = await activityService.getSentimentBatch(activityChunk);
        }
        catch (e) {
            await (0, common_1.timeout)(3000);
            sentiments = await activityService.getSentimentBatch(activityChunk);
        }
        activityChunk = activityChunk.map((a, index) => {
            a.sentiment = sentiments[index];
            return a;
        });
        await options.database.activity.bulkCreate(activityChunk, {
            updateOnDuplicate: ['sentiment'],
        });
    }
};
//# sourceMappingURL=2022-10-11-api-v1-activity-sentiment.js.map