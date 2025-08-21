const { FunctionalitiesRepository } = require('../repositories');
const {
  GetFunctionalitiesList,
} = require('../../application/functionalities');
const FunctionalitiesController = require('../controllers/FunctionalitiesController');

module.exports = function registerController({ models }) {
  const functionalitiesRepository = new FunctionalitiesRepository(models);

  const getFunctionalitiesList = new GetFunctionalitiesList(functionalitiesRepository);

  return new FunctionalitiesController({
    getFunctionalitiesList,
  });
};
