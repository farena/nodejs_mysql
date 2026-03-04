module.exports = ({
  singularSC,
  singularPC,
  pluralCC,
}) => `class Activate${singularPC} {
  constructor(${pluralCC}Repository) {
    this.$${pluralCC} = ${pluralCC}Repository;
  }

  async execute({ ${singularSC}_id }) {
    await this.$${pluralCC}.activate({
      ${singularSC}_id,
    });

    return '${singularPC} activated succesfully';
  }
}

module.exports = Activate${singularPC};
`;
