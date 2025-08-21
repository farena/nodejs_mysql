class GetFunctionalitiesList {
  constructor(functionalitiesRepository) {
    this.$functionalities = functionalitiesRepository;
  }

  async execute() {
    const functionalities = await this.$functionalities.list();

    return functionalities;
  }
}

module.exports = GetFunctionalitiesList;
