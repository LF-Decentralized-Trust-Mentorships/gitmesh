"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const conversationSettings = sequelize.define('conversationSettings', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        enabled: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
        },
        customUrl: {
            type: sequelize_1.DataTypes.TEXT,
        },
        logoUrl: {
            type: sequelize_1.DataTypes.TEXT,
        },
        faviconUrl: {
            type: sequelize_1.DataTypes.TEXT,
        },
        theme: {
            type: sequelize_1.DataTypes.JSONB,
        },
        autoPublish: {
            type: sequelize_1.DataTypes.JSONB,
        },
    });
    conversationSettings.associate = (models) => {
        models.conversationSettings.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.conversationSettings.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.conversationSettings.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return conversationSettings;
};
//# sourceMappingURL=conversationSettings.js.map