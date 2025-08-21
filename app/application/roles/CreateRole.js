class CreateRole {
  constructor(rolesRepository, transactionRepository, ValidateRoleData) {
    this.$roles = rolesRepository;
    this.$transaction = transactionRepository;
    this.$validator = ValidateRoleData;
  }

  async execute({ name, functionalities }) {
    await this.$validator.execute({
      name,
    });

    await this.$transaction.handleTransaction(async (transaction) => {
      const role = await this.$roles.create({
        name,
        transaction,
      });

      await this.$roles.upsertFunctionalities({
        role_id: role.role_id,
        funcs: functionalities,
        transaction,
      });
    });

    return "Role created succesfully";
  }
}

module.exports = CreateRole;
