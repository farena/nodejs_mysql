class GetRolesPaginableList {
  constructor(rolesRepository) {
    this.$roles = rolesRepository;
  }

  async execute({ pagerOpts, filters }) {
    const roles = await this.$roles.paginate({
      pagerOpts,
      filters,
    });

    return roles;
  }
}

module.exports = GetRolesPaginableList;
