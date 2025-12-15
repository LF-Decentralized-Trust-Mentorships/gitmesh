"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const activity = sequelize.define('activity', {
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
        timestamp: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        platform: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        isContribution: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        score: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 2,
        },
        sourceId: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        sourceParentId: {
            type: sequelize_1.DataTypes.STRING(255),
        },
        username: {
            type: sequelize_1.DataTypes.TEXT,
        },
        objectMemberUsername: {
            type: sequelize_1.DataTypes.TEXT,
        },
        attributes: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
        },
        channel: {
            type: sequelize_1.DataTypes.TEXT,
        },
        body: {
            type: sequelize_1.DataTypes.TEXT,
        },
        title: {
            type: sequelize_1.DataTypes.TEXT,
        },
        url: {
            type: sequelize_1.DataTypes.TEXT,
        },
        sentiment: {
            type: sequelize_1.DataTypes.JSONB,
            defaultValue: {},
        },
        importHash: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                len: [0, 255],
            },
        },
        organizationId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
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
                fields: ['platform', 'tenantId', 'type', 'timestamp'],
                where: {
                    deletedAt: null,
                },
            },
            {
                unique: false,
                fields: ['timestamp', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
            {
                fields: ['sourceId', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
            {
                unique: false,
                fields: ['memberId', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
            {
                unique: false,
                fields: ['sourceParentId', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
            {
                unique: false,
                fields: ['deletedAt'],
            },
            {
                unique: false,
                fields: ['parentId', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
            {
                unique: false,
                fields: ['conversationId', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
        ],
        timestamps: true,
        paranoid: true,
    });
    activity.associate = (models) => {
        models.activity.belongsTo(models.member, {
            as: 'member',
            onDelete: 'cascade',
            foreignKey: {
                allowNull: false,
            },
        });
        models.activity.belongsTo(models.segment, {
            as: 'segment',
            foreignKey: {
                allowNull: false,
            },
        });
        models.activity.belongsTo(models.member, {
            as: 'objectMember',
        });
        models.activity.belongsTo(models.conversation, {
            as: 'conversation',
        });
        models.activity.belongsTo(models.activity, {
            as: 'parent',
            // constraints: false,
        });
        models.activity.belongsToMany(models.task, {
            as: 'tasks',
            through: 'activityTasks',
        });
        models.activity.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.activity.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.activity.belongsTo(models.user, {
            as: 'updatedBy',
        });
        models.activity.belongsTo(models.organization, {
            as: 'organization',
        });
    };
    return activity;
};
//# sourceMappingURL=activity.js.map