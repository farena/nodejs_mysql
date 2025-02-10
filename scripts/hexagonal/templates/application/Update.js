module.exports = ({ singularSC, singularPC, pluralCC }, use_cases) => {
  const withValidator = use_cases.includes('validate');

  return `class Update${singularPC} {
  constructor(${pluralCC}Repository${
    withValidator ? `, Validate${singularPC}Data` : ''
  }) {
    this.$${pluralCC} = ${pluralCC}Repository;${
    withValidator
      ? `
    this.$validator = Validate${singularPC}Data;`
      : ''
  }
  }

  async execute({ ${singularSC}_id, column_1, column_2 }) {${
    withValidator
      ? `
    await this.$validator.execute({ column_1, column_2 });
`
      : ''
  }
    await this.$${pluralCC}.update({
      ${singularSC}_id, column_1, column_2,
    });

    return '${singularPC} updated succesfully';
  }
}

module.exports = Update${singularPC};
`;
};
