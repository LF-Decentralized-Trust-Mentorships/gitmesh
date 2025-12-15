"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const microservice = sequelize.define('microservice', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        init: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        running: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        type: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        variant: {
            type: sequelize_1.DataTypes.TEXT,
            validate: {
                isIn: [['default', 'premium']],
            },
            defaultValue: 'default',
        },
        settings: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
        },
        importHash: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                len: [0, 255],
            },
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['importHash', 'tenantId'],
            },
            {
                unique: true,
                fields: ['type', 'tenantId'],
            },
        ],
        timestamps: true,
    });
    microservice.associate = (models) => {
        models.microservice.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.microservice.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.microservice.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return microservice;
};
//# sourceMappingURL=microservice.js.map