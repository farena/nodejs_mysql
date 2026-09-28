class UpdateUserProfile {
  constructor(usersRepository, ValidateUserData, usersHelper) {
    this.$user = usersRepository;
    this.$validator = ValidateUserData;
    this.$helper = usersHelper;
  }

  async execute({
    user_id,
    first_name,
    last_name,
    password,
    new_password,
    new_password_confirmation,
  }) {
    await this.$validator.execute({
      new_password,
      new_password_confirmation,
      type: "profileUpdate",
    });

    const user = await this.$user.getUserById({ user_id });

    await this.$helper.checkPassword({
      password,
      user_password: user.password,
    });

    await this.$user.update({
      user_id,
      first_name,
      last_name,
      password: new_password,
    });

    return "Profile updated succesfully";
  }
}

module.exports = UpdateUserProfile;
