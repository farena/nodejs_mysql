module.exports = ({ singularPC, pluralCC }, use_cases) => {
  const withValidator = use_cases.includes('validate');

  return `class Create${singularPC} {
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

  async execute({ column_1, column_2 }) {${
    withValidator
      ? `
    await this.$validator.execute({ column_1, column_2 });
`
      : ''
  }
    await this.$${pluralCC}.create({
      column_1, column_2,
    });

    return '${singularPC} created succesfully';
  }
}

module.exports = Create${singularPC};
`;
};
