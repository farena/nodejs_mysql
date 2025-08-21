const CustomError = require('../../domain/exceptions/CustomError');

class VerifyUser {
  constructor(usersRepository, ValidateUserData) {
    this.$user = usersRepository;
    this.$validator = ValidateUserData;
  }

  async execute({ verification_code, password, password_confirmation }) {
    await this.$validator.execute({
      verification_code,
      password,
      password_confirmation,
      type: 'verify',
    });

    const user = await this.$user.getUserByVerificationCode({
      verification_code,
    });

    if (user.is_active) throw new CustomError('User is already active', 412);

    await this.$user.update({
      user_id: user.user_id,
      is_active: true,
      password,
      verification_code: null,
    });

    return 'User verified succesfully';
  }
}

module.exports = VerifyUser;
