import { DataTypes } from 'sequelize'

const signalsContentModel = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  platform: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  post: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  postedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}

export default (sequelize) => {
  const signalsContent = sequelize.define('signalsContent', signalsContentModel, {
    timestamps: true,
    paranoid: false,
  })

  signalsContent.associate = (models) => {
    models.signalsContent.belongsTo(models.tenant, {
      as: 'tenant',
      foreignKey: {
        allowNull: false,
      },
    })
    models.signalsContent.hasMany(models.signalsAction, {
      as: 'actions',
      foreignKey: 'contentId',
    })
  }

  return signalsContent
}

export { signalsContentModel }
