module.exports = ({
  singularSC,
  singularPC,
  pluralCC,
}) => `class Deactivate${singularPC} {
  constructor(${pluralCC}Repository) {
    this.$${pluralCC} = ${pluralCC}Repository;
  }

  async execute({ ${singularSC}_id }) {
    await this.$${pluralCC}.deactivate({
      ${singularSC}_id,
    });

    return '${singularPC} deactivated succesfully';
  }
}

module.exports = Deactivate${singularPC};
`;
