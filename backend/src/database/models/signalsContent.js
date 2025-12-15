"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalsContentModel = void 0;
const sequelize_1 = require("sequelize");
const signalsContentModel = {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    platform: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    post: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    url: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    postedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
};
exports.signalsContentModel = signalsContentModel;
exports.default = (sequelize) => {
    const signalsContent = sequelize.define('signalsContent', signalsContentModel, {
        timestamps: true,
        paranoid: false,
    });
    signalsContent.associate = (models) => {
        models.signalsContent.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.signalsContent.hasMany(models.signalsAction, {
            as: 'actions',
            foreignKey: 'contentId',
        });
    };
    return signalsContent;
};
//# sourceMappingURL=signalsContent.js.map