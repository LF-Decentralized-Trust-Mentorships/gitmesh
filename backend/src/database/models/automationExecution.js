"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const automationExecution = sequelize.define('automationExecution', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        automationId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        type: {
            type: sequelize_1.DataTypes.STRING(80),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        tenantId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        trigger: {
            type: sequelize_1.DataTypes.STRING(80),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        state: {
            type: sequelize_1.DataTypes.STRING(80),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        error: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
        },
        executedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        eventId: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        payload: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                fields: ['automationId'],
            },
        ],
        timestamps: false,
        paranoid: false,
    });
    automationExecution.associate = (models) => {
        models.automationExecution.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.automationExecution.belongsTo(models.automation, {
            as: 'automation',
            foreignKey: {
                allowNull: false,
            },
        });
    };
    return automationExecution;
};
//# sourceMappingURL=automationExecution.js.map