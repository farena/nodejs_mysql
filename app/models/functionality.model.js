const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Functionality extends Model {
    static associate(models) {
      models.functionality.hasMany(models.functionality_role, {
        foreignKey: "functionality_id",
        targetKey: "functionality_id",
      });

      models.functionality.belongsToMany(models.endpoint, {
        as: "endpoints",
        through: models.functionality_endpoint,
        foreignKey: "functionality_id",
        otherKey: "endpoint_id",
      });
    }
  }
  Functionality.init(
    {
      functionality_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "functionality",
    }
  );
  return Functionality;
};
