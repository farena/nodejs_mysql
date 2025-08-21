const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FunctionalityEndpoint extends Model {
    static associate(models) {
      models.functionality_endpoint.belongsTo(models.functionality, {
        foreignKey: 'functionality_id',
        targetKey: 'functionality_id',
      });
      models.functionality_endpoint.belongsTo(models.endpoint, {
        foreignKey: 'endpoint_id',
        targetKey: 'endpoint_id',
      });
    }
  }
  FunctionalityEndpoint.init(
    {
      functionality_endpoint_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      functionality_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      endpoint_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'functionality_endpoint',
      timestamps: false,
    },
  );
  return FunctionalityEndpoint;
};
