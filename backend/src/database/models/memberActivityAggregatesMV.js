"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    // define your materialized view model
    const memberActivityAggregatesMV = sequelize.define('memberActivityAggregatesMV', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        lastActive: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        activeOn: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        },
        averageSentiment: {
            type: sequelize_1.DataTypes.FLOAT,
        },
        activityCount: {
            type: sequelize_1.DataTypes.INTEGER,
        },
        activeDaysCount: {
            type: sequelize_1.DataTypes.INTEGER,
        },
        identities: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        },
        username: {
            type: sequelize_1.DataTypes.JSONB,
        },
    });
    return memberActivityAggregatesMV;
};
//# sourceMappingURL=memberActivityAggregatesMV.js.map