"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const member = sequelize.define('member', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        attributes: {
            type: sequelize_1.DataTypes.JSONB,
            defaultValue: {},
        },
        displayName: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        emails: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            defaultValue: [],
        },
        score: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: -1,
        },
        joinedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        importHash: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                len: [0, 255],
            },
        },
        reach: {
            type: sequelize_1.DataTypes.JSONB,
            defaultValue: {
                total: -1,
            },
        },
        contributions: {
            type: sequelize_1.DataTypes.JSONB,
        },
        lastEnriched: {
            type: sequelize_1.DataTypes.DATE,
        },
        enrichedBy: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        },
        manuallyCreated: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
            // Below are B-tree indexes for speeding up search in normal fields
            {
                unique: false,
                fields: ['score', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
            {
                unique: false,
                fields: ['joinedAt', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
            {
                unique: false,
                fields: ['createdAt', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
        ],
        timestamps: true,
        paranoid: true,
    });
    member.associate = (models) => {
        models.member.hasMany(models.memberIdentity, {
            as: 'memberIdentities',
            foreignKey: 'memberId',
        });
        models.member.belongsToMany(models.segment, {
            as: 'segments',
            through: 'memberSegments',
            timestamps: false,
        });
        models.member.hasOne(models.memberActivityAggregatesMV, {
            as: 'memberActivityAggregatesMVs',
            foreignKey: 'id',
        });
        models.member.hasMany(models.activity, {
            as: 'activities',
        });
        models.member.belongsToMany(models.note, {
            as: 'notes',
            through: 'memberNotes',
        });
        models.member.belongsToMany(models.task, {
            as: 'tasks',
            through: 'memberTasks',
        });
        models.member.belongsToMany(models.tag, {
            as: 'tags',
            through: 'memberTags',
        });
        models.member.belongsToMany(models.member, {
            as: 'noMerge',
            through: 'memberNoMerge',
        });
        models.member.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.member.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.member.belongsTo(models.user, {
            as: 'updatedBy',
        });
        models.member.belongsToMany(models.member, {
            as: 'toMerge',
            through: 'memberToMerge',
        });
        models.member.belongsToMany(models.organization, {
            as: 'organizations',
            through: 'memberOrganizations',
        });
    };
    return member;
};
//# sourceMappingURL=member.js.map