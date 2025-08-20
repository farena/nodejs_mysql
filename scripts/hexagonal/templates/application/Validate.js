module.exports = ({ singularPC }, fields) => `class Validate${singularPC}Data {
  constructor(Validator) {
    this.$validator = Validator;
  }

  /**
   * Using validatorJS.
   * For documentation: https://github.com/mikeerickson/validatorjs
   */
  async execute({ ${fields.map((field) => field.name).join(", ")} }) {
    await this.$validator({
      ${fields.map((field) => field.name).join(",\n      ")},
    }, {
      ${fields.map((field) => `${field.name}: 'required'`).join(",\n      ")},
    }, {
      ${fields
        .map((field) => `'required.${field.name}': '${field.name} is required'`)
        .join(",\n      ")},
    });
  }
}

module.exports = Validate${singularPC}Data;
`;
