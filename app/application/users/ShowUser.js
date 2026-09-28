const CustomError = require("../../domain/exceptions/CustomError");

class ShowUser {
  constructor(usersRepository) {
    this.$user = usersRepository;
  }

  async execute({ user_id }) {
    const user = await this.$user.getUserById({
      user_id,
      include: "role",
      password: false,
    });
    if (!user) throw new CustomError("User not found", 404);

    return user;
  }
}

module.exports = ShowUser;
