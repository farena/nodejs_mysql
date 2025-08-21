class GetUsersList {
  constructor(usersRepository) {
    this.$user = usersRepository;
  }

  async execute({ filters }) {
    return this.$user.list({ filters });
  }
}

module.exports = GetUsersList;
