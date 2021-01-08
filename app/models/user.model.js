const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Add relationships here
    }

    checkPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      fullname: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.getDataValue('first_name')} ${this.getDataValue('last_name')}`;
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
          this.setDataValue('password', bcrypt.hashSync(value, 10));
        },
      },
    },
    {
      scopes: {
        noPassword: {
          attributes: { exclude: ['password'] },
        },
      },
      sequelize,
      modelName: 'user',
    },
  );
  return User;
};
