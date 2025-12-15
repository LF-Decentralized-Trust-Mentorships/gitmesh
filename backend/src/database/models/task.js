"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const task = sequelize.define('task', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        body: {
            type: sequelize_1.DataTypes.TEXT,
        },
        type: {
            type: sequelize_1.DataTypes.STRING(255),
            validate: {
                isIn: [['regular', 'suggested']],
            },
            defaultValue: 'regular',
        },
        status: {
            type: sequelize_1.DataTypes.STRING(255),
            validate: {
                isIn: [['in-progress', 'done', 'archived']],
            },
            defaultValue: 'in-progress',
        },
        dueDate: {
            type: sequelize_1.DataTypes.DATE,
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
                fields: ['name', 'tenantId'],
                where: {
                    deletedAt: null,
                },
            },
        ],
        timestamps: true,
        paranoid: true,
    });
    task.associate = (models) => {
        models.task.belongsToMany(models.member, {
            as: 'members',
            through: 'memberTasks',
            foreignKey: 'taskId',
        });
        models.task.belongsToMany(models.activity, {
            as: 'activities',
            through: 'activityTasks',
            foreignKey: 'taskId',
        });
        models.task.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.task.belongsTo(models.segment, {
            as: 'segment',
            foreignKey: {
                allowNull: false,
            },
        });
        models.task.belongsToMany(models.user, {
            as: 'assignees',
            through: 'taskAssignees',
            foreignKey: 'taskId',
        });
        models.task.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.task.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return task;
};
//# sourceMappingURL=task.js.map