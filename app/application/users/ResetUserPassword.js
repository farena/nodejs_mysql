class ResetUserPassword {
  constructor(usersRepository, Validator) {
    this.$user = usersRepository;
    this.$validator = Validator;
  }

  async execute({ token, password, password_confirmation }) {
    await this.validate({ password, password_confirmation });

    const user = await this.$user.getUserByResetCode({
      reset_code: token,
    });

    await this.$user.update({
      user_id: user.user_id,
      password,
      reset_code: null,
    });

    return "Password updated succesfully";
  }

  async validate({ password, password_confirmation }) {
    await this.$validator(
      {
        password,
        password_confirmation,
      },
      {
        password: "required|min:6|confirmed",
      },
      {
        "required.password": "Password is required",
        "confirmed.password": "Passwords must be identical",
        "min.password": "Password must be at least 6 characters long",
      }
    );
  }
}

module.exports = ResetUserPassword;
