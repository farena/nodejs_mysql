class DeactivateUser {
  constructor(usersRepository) {
    this.$user = usersRepository;
  }

  async execute({ user_id }) {
    await this.$user.update({
      user_id,
      is_active: false,
    });

    return 'User deactivated succesfully';
  }
}

module.exports = DeactivateUser;
