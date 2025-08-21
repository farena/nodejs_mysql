class ValidateRoleData {
  constructor(Validator) {
    this.$validator = Validator;
  }

  /**
   * Using validatorJS.
   * For documentation: https://github.com/mikeerickson/validatorjs
   */
  async execute({ name }) {
    await this.$validator(
      {
        name,
      },
      {
        name: "required",
      },
      {
        "required.name": "Name is required",
      }
    );
  }
}

module.exports = ValidateRoleData;
