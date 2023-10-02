class UpdateUserProfile {
  constructor({ usersRepository, validator }) {
    this.$user = usersRepository;
    this.validator = validator;
  }

  async execute({ password, new_password, new_password_confirmation, user }) {
    console.log(user);
    await this.validate({ password, new_password, new_password_confirmation });

    const userModel = await this.$user.getUserById({ user_id: user.user_id });
    
    if(!this.$user.checkPassword({ password, user_password: userModel.password })) {
      throw new CustomError('Password is incorrect', 412)
    }

    await this.$user.updateUser({
      user_id: userModel.user_id,
      password: new_password,
    })
  }

  validate({ password, new_password, new_password_confirmation }) {
    return this.validator(
      {
        password,
        new_password,
        new_password_confirmation,
      },
      {
        password: "required",
        new_password: "required|confirmed|min:6",
      },
      {
        "required.password": "Please send your current password",
        "confirmed.new_password": "Password doesnt match",
        "min.new_password": "New password must have at least 6 chars",
      }
    );
  }
}

module.exports = UpdateUserProfile;
