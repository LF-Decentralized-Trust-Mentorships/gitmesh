"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const automation = sequelize.define('automation', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        type: {
            type: sequelize_1.DataTypes.STRING(80),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        name: {
            type: sequelize_1.DataTypes.STRING(255),
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
        settings: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: false,
        },
        state: {
            type: sequelize_1.DataTypes.STRING(80),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
    }, {
        indexes: [
            {
                fields: ['type', 'tenantId', 'trigger', 'state'],
            },
        ],
        timestamps: true,
    });
    automation.associate = (models) => {
        models.automation.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.automation.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.automation.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return automation;
};
//# sourceMappingURL=automation.js.map