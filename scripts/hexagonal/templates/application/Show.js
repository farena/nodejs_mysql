module.exports = ({
  singularSC, singularPC, singularCC, pluralCC,
}) => `class Show${singularPC} {
  constructor(${pluralCC}Repository) {
    this.$${pluralCC} = ${pluralCC}Repository;
  }

  async execute({ ${singularSC}_id }) {
    const ${singularCC} = await this.$${pluralCC}.show({
      ${singularSC}_id,
    });

    return ${singularCC};
  }
}

module.exports = Show${singularPC};
`;
