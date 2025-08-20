/* eslint-disable operator-linebreak */
module.exports = ({ singularSC, singularPC, pluralCC }, use_cases, fields) => {
  const withValidator = use_cases.includes("validate");

  return `class Update${singularPC} {
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

  async execute({ ${singularSC}_id, ${fields
    .map((field) => field.name)
    .join(", ")} }) {${
    withValidator
      ? `
    await this.$validator.execute({ 
      ${fields.map((field) => field.name).join(",\n      ")}
    });
`
      : ""
  }
    await this.$${pluralCC}.update({
      ${singularSC}_id, 
      ${fields.map((field) => field.name).join(",\n      ")},
    });

    return '${singularPC} updated succesfully';
  }
}

module.exports = Update${singularPC};
`;
};
