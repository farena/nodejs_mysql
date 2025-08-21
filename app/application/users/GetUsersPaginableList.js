class GetUsersList {
  constructor(usersRepository) {
    this.$user = usersRepository;
  }

  async execute({ pagerOpts, filters }) {
    return this.$user.paginate({
      pagerOpts,
      filters,
    });
  }
}

module.exports = GetUsersList;
