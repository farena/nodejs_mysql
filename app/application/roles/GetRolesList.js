class GetRolesList {
  constructor(rolesRepository) {
    this.$roles = rolesRepository;
  }

  async execute() {
    const roles = await this.$roles.list();

    return roles;
  }
}

module.exports = GetRolesList;
