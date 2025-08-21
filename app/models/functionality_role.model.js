const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FunctionalityRole extends Model {
    static associate(models) {
      models.functionality_role.belongsTo(models.role, {
        foreignKey: 'role_id',
        targetKey: 'role_id',
      });
      models.functionality_role.belongsTo(models.functionality, {
        foreignKey: 'functionality_id',
        targetKey: 'functionality_id',
      });
    }
  }
  FunctionalityRole.init(
    {
      functionality_role_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      functionality_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('r', 'rw'),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'functionality_role',
      timestamps: false,
    },
  );
  return FunctionalityRole;
};
