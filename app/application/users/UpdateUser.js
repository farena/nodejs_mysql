const CustomError = require("../../domain/exceptions/CustomError");

class UpdateUser {
  constructor(usersRepository, transactionsRepository, ValidateUserData) {
    this.$user = usersRepository;
    this.$transaction = transactionsRepository;
    this.$validator = ValidateUserData;
  }

  async execute({ user_id, first_name, last_name, email, role_id }) {
    if (user_id === 1) {
      throw new CustomError("You cannot update the admin user", 403);
    }

    await this.$validator.execute({
      first_name,
      last_name,
      email,
      role_id,
    });

    return this.$transaction.handleTransaction(async (transaction) => {
      const user = await this.$user.getUserById({
        user_id,
        transaction,
        include: "role",
      });

      if (!user) throw new CustomError("User not found", 404);

      await this.$user.update({
        user_id,
        first_name,
        last_name,
        email,
        role_id,
      });

      return "User updated succesfully";
    });
  }
}

module.exports = UpdateUser;
