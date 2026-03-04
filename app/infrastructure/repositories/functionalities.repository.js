class FunctionalitiesRepository {
  constructor(models) {
    this.models = models;
  }

  async list() {
    const functionalities = await this.models.functionality.findAll({
      order: [["name", "asc"]],
    });

    return functionalities;
  }
}

module.exports = FunctionalitiesRepository;
