"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const memberIdentity = sequelize.define('memberIdentity', {
        memberId: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
        },
        platform: {
            type: sequelize_1.DataTypes.TEXT,
            primaryKey: true,
        },
        username: {
            type: sequelize_1.DataTypes.TEXT,
            primaryKey: true,
        },
        sourceId: {
            type: sequelize_1.DataTypes.TEXT,
        },
        tenantId: {
            type: sequelize_1.DataTypes.UUID,
        },
        integrationId: {
            type: sequelize_1.DataTypes.UUID,
        },
    });
    memberIdentity.associate = (models) => {
        models.memberIdentity.belongsTo(models.member, {
            foreignKey: 'memberId',
            as: 'member',
        });
    };
    return memberIdentity;
};
//# sourceMappingURL=memberIdentity.js.map