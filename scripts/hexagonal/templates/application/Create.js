/* eslint-disable operator-linebreak */
module.exports = ({ singularPC, pluralCC }, use_cases, fields) => {
  const withValidator = use_cases.includes("validate");

  return `class Create${singularPC} {
  constructor(${pluralCC}Repository${
    withValidator ? `, Validate${singularPC}Data` : ""
  }) {
    this.$${pluralCC} = ${pluralCC}Repository;${
    withValidator
      ? `
    this.$validator = Validate${singularPC}Data;`
      : ""
  }
  }

  async execute({ ${fields.map((field) => field.name).join(", ")} }) {${
    withValidator
      ? `
    await this.$validator.execute({ 
      ${fields.map((field) => `${field.name}`).join(",\n      ")}
    });
`
      : ""
  }
    await this.$${pluralCC}.create({
      ${fields.map((field) => field.name).join(",\n      ")},
    });

    return '${singularPC} created succesfully';
  }
}

module.exports = Create${singularPC};
`;
};
