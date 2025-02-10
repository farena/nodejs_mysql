module.exports = ({singularSC, singularPC, pluralCC}) => `class Delete${singularPC} {
  constructor(${pluralCC}Repository) {
    this.$${pluralCC} = ${pluralCC}Repository;
  }

  async execute({ ${singularSC}_id }) {
    await this.$${pluralCC}.delete({
      ${singularSC}_id,
    });

    return '${singularPC} deleted succesfully';
  }
}

module.exports = Delete${singularPC};
`;
