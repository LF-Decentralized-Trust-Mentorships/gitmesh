"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const report = sequelize.define('report', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        public: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isTemplate: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        name: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        importHash: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                len: [0, 255],
            },
        },
        viewedBy: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
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
    report.associate = (models) => {
        models.report.hasMany(models.widget, {
            as: 'widgets',
            constraints: false,
            foreignKey: 'reportId',
            onDelete: 'cascade',
        });
        models.report.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.report.belongsTo(models.segment, {
            as: 'segment',
        });
        models.report.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.report.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return report;
};
//# sourceMappingURL=report.js.map