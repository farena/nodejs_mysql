const CustomError = require('../../domain/exceptions/CustomError');

class DeactivateUser {
  constructor(usersRepository) {
    this.$user = usersRepository;
  }

  async execute({ user_id }) {
    const user = await this.$user.getUserById({
      user_id,
    });
    if (user.verification_code)
      throw new CustomError('User is not verified yet', 412);

    await this.$user.update({
      user_id,
      is_active: true,
    });

    return 'User activated succesfully';
  }
}

module.exports = DeactivateUser;
