"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    const note = sequelize.define('note', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        body: {
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
        indexes: [],
        timestamps: true,
        paranoid: true,
    });
    note.associate = (models) => {
        models.note.belongsToMany(models.member, {
            as: 'members',
            through: 'memberNotes',
            foreignKey: 'noteId',
        });
        models.note.belongsTo(models.tenant, {
            as: 'tenant',
            foreignKey: {
                allowNull: false,
            },
        });
        models.note.belongsTo(models.user, {
            as: 'createdBy',
        });
        models.note.belongsTo(models.user, {
            as: 'updatedBy',
        });
    };
    return note;
};
//# sourceMappingURL=note.js.map