const { getResponseCustom } = require('../libs/serviceUtil');

class FunctionalitiesController {
  constructor({
    getFunctionalitiesList,
  }) {
    this.name = 'functionalitiesController';
    this.getFunctionalitiesList = getFunctionalitiesList;
  }

  async index(req, res, next) {
    try {
      const result = await this.getFunctionalitiesList.execute();

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

}

module.exports = FunctionalitiesController;
