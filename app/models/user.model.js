const { Model } = require("sequelize");
const fullTextSearch = require("../infrastructure/libs/fullTextSearch.js");

// Search Columns
const searchColumns = ["first_name", "last_name", "email"];

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      models.user.belongsTo(models.role, {
        targetKey: "role_id",
        foreignKey: "role_id",
      });
    }
  }
  User.init(
    {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      fullname: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.getDataValue("first_name")} ${this.getDataValue(
            "last_name"
          )}`;
        },
      },
      first_name: {
        type: DataTypes.STRING,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue("password", bcrypt.hashSync(value, 10));
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "role",
          key: "role_id",
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      verification_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      scopes: {
        basic: {
          attributes: [
            "user_id",
            "first_name",
            "last_name",
            "email",
            "fullname",
          ],
        },
        noPassword: {
          attributes: { exclude: ["password"] },
        },
        search: fullTextSearch(sequelize, searchColumns),
      },
      sequelize,
      modelName: "user",
    }
  );
  return User;
};
