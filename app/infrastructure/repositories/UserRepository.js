const bcrypt = require('bcrypt');
const CustomError = require('../../domain/exceptions/CustomError');

class UsersRepository {
  constructor(models) {
    this.models = models;
  }

  async getUserByEmail({ email, transaction }) {
    const user = await this.models.user.findOne({
      transaction,
      where: {
        email,
      },
    });
    if (!user) throw new CustomError('User not found', 404);

    return user;
  }

  async getUserById({ user_id, transaction }) {
    const user = await this.models.user.findOne({
      transaction,
      where: {
        user_id,
      },
    });
    if (!user) throw new CustomError('User not found', 404);

    return user;
  }

  async updateUser({ user_id, password }) {
    await this.models.user.update({
      password: bcrypt.hashSync(password, 10),
    }, {
      where: {
        user_id,
      },
    });
  }

  checkPassword({ password, user_password }) {
    return bcrypt.compareSync(password, user_password);
  }
}

module.exports = UsersRepository;
