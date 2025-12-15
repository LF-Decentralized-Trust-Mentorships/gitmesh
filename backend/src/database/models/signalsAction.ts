import { DataTypes } from 'sequelize'

const signalsActionModel = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.TEXT,
    validate: {
      isIn: [['thumbs-up', 'thumbs-down', 'bookmark']],
    },
    defaultValue: null,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}

export default (sequelize) => {
  const signalsAction = sequelize.define('signalsAction', signalsActionModel, {
    timestamps: true,
    paranoid: false,
  })

  signalsAction.associate = (models) => {
    models.signalsAction.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    })

    models.signalsAction.belongsTo(models.user, {
      as: 'actionBy',
    })

    models.signalsAction.belongsTo(models.signalsContent, {
      as: 'content',
    })
  }

  return signalsAction
}

export { signalsActionModel }
