const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      models.role.belongsToMany(models.functionality, {
        as: "functionalities",
        through: models.functionality_role,
        foreignKey: "role_id",
        otherKey: "functionality_id",
      });
      models.role.hasMany(models.functionality_role, {
        foreignKey: "role_id",
        targetKey: "role_id",
      });
      models.role.hasMany(models.user, {
        foreignKey: "role_id",
        targetKey: "role_id",
      });
    }
  }
  Role.init(
    {
      role_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      by_system: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      hooks: {
        afterCreate: async (role, { transaction }) => {
          const lastRole = await Role.findOne({
            order: [["sort", "DESC"]],
            transaction,
          });
          role.sort = lastRole.sort + 1;
          await role.save({ transaction });
        },
      },
      sequelize,
      modelName: "role",
    }
  );
  return Role;
};
