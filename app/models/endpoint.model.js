const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Endpoint extends Model {}
  Endpoint.init(
    {
      endpoint_id: {
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
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      method: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "endpoint",
      timestamps: false,
    }
  );
  return Endpoint;
};
