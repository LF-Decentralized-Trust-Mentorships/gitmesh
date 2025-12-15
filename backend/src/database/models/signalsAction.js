"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalsActionModel = void 0;
const sequelize_1 = require("sequelize");
const signalsActionModel = {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: sequelize_1.DataTypes.TEXT,
        validate: {
            isIn: [['thumbs-up', 'thumbs-down', 'bookmark']],
        },
        defaultValue: null,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
};
exports.signalsActionModel = signalsActionModel;
exports.default = (sequelize) => {
    const signalsAction = sequelize.define('signalsAction', signalsActionModel, {
        timestamps: true,
        paranoid: false,
    });
    signalsAction.associate = (models) => {
        models.signalsAction.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.signalsAction.belongsTo(models.user, {
            as: 'actionBy',
        });
        models.signalsAction.belongsTo(models.signalsContent, {
            as: 'content',
        });
    };
    return signalsAction;
};
//# sourceMappingURL=signalsAction.js.map