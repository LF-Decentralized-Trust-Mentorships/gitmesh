"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const tag = sequelize.define('tag', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
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
    }, {
        indexes: [
            {
                unique: true,
                fields: ['importHash', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
            {
                unique: true,
                fields: ['name', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
        ],
        timestamps: true,
        paranoid: true,
    });
    tag.associate = (models) => {
        models.tag.belongsToMany(models.member, {
            as: 'members',
            through: 'memberTags',
            foreignKey: 'tagId',
        });
        models.tag.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.tag.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.tag.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return tag;
};
//# sourceMappingURL=tag.js.map