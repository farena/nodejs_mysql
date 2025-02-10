module.exports = ({ singularPC }) => `class Validate${singularPC}Data {
  constructor(Validator) {
    this.$validator = Validator;
  }

  /**
   * Using validatorJS.
   * For documentation: https://github.com/mikeerickson/validatorjs
   */
  async execute({ column_1, column_2 }) {
    await this.$validator({
      column_1, column_2,
    }, {
      column_1: 'required',
      column_2: 'required',
    }, {
      'required.column_1': 'Column 1 is required',
      'required.column_2': 'Column 2 is required',
    });
  }
}

module.exports = Validate${singularPC}Data;
`;
