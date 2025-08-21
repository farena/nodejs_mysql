class ShowUser {
  constructor(usersRepository) {
    this.$user = usersRepository;
  }

  async execute({ user_id }) {
    return this.$user.getUserById({
      user_id,
      include: "role",
      password: false,
    });
  }
}

module.exports = ShowUser;
