const CustomError = require('../../domain/exceptions/CustomError');

class DeactivateUser {
  constructor(usersRepository) {
    this.$user = usersRepository;
  }

  async execute({ user_id }) {
    const user = await this.$user.getUserById({
      user_id,
    });
    if (!user) throw new CustomError('User not found', 404);

    await this.$user.update({
      user_id,
      is_active: false,
    });

    return 'User deactivated succesfully';
  }
}

module.exports = DeactivateUser;
