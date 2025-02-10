module.exports = ({
  pluralPC,
  pluralCC,
}) => `class Get${pluralPC}PaginableList {
  constructor(${pluralCC}Repository) {
    this.$${pluralCC} = ${pluralCC}Repository;
  }

  async execute({ pagerOpts, filters }) {
    const ${pluralCC} = await this.$${pluralCC}.paginate({
      pagerOpts,
      filters,
    });

    return ${pluralCC};
  }
}

module.exports = Get${pluralPC}PaginableList;
`;
