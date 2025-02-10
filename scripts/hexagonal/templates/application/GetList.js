module.exports = ({pluralPC, pluralCC}) => `class Get${pluralPC}List {
  constructor(${pluralCC}Repository) {
    this.$${pluralCC} = ${pluralCC}Repository;
  }

  async execute() {
    const ${pluralCC} = await this.$${pluralCC}.list();

    return ${pluralCC};
  }
}

module.exports = Get${pluralPC}List;
`;
