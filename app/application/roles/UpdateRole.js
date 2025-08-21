class UpdateRole {
  constructor(rolesRepository, transactionRepository, ValidateRoleData) {
    this.$roles = rolesRepository;
    this.$transaction = transactionRepository;
    this.$validator = ValidateRoleData;
  }

  async execute({ role_id, name, functionalities }) {
    await this.$validator.execute({
      name,
    });

    await this.$transaction.handleTransaction(async (transaction) => {
      const role = await this.$roles.update({
        role_id,
        name,
        transaction,
      });

      await this.$roles.upsertFunctionalities({
        role_id,
        funcs: functionalities,
        prev_funcs: role.functionalities,
        transaction,
      });
    });

    return "Role updated succesfully";
  }
}

module.exports = UpdateRole;
