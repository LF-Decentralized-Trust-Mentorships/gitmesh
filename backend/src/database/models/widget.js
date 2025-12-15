"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const widget = sequelize.define('widget', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        type: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        title: {
            type: sequelize_1.DataTypes.TEXT,
        },
        settings: {
            type: sequelize_1.DataTypes.JSONB,
        },
        cache: {
            type: sequelize_1.DataTypes.JSONB,
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
                where: {
                    deletedAt: null,
                },
            },
        ],
        timestamps: true,
        paranoid: true,
    });
    widget.associate = (models) => {
        models.widget.belongsTo(models.report, {
            as: 'report',
        });
        models.widget.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.widget.belongsTo(models.segment, {
            as: 'segment',
            foreignKey: {
                allowNull: false,
            },
        });
        models.widget.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.widget.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return widget;
};
//# sourceMappingURL=widget.js.map