class DeleteRole {
  constructor(rolesRepository) {
    this.$roles = rolesRepository;
  }

  async execute({ role_id }) {
    await this.$roles.delete({
      role_id,
    });

    return 'Role deleted succesfully';
  }
}

module.exports = DeleteRole;
