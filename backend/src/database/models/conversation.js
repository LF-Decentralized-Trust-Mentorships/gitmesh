"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const conversation = sequelize.define('conversation', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        slug: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        published: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['slug', 'tenantId'],
            },
        ],
        timestamps: true,
    });
    conversation.associate = (models) => {
        models.conversation.hasMany(models.activity, {
            as: 'activities',
        });
        models.conversation.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.conversation.belongsTo(models.segment, {
            as: 'segment',
            foreignKey: {
                allowNull: false,
            },
        });
        models.conversation.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.conversation.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return conversation;
};
//# sourceMappingURL=conversation.js.map