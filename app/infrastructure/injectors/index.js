const usersInjector = require("./usersInjector");
const rolesInjector = require('./rolesInjector');
const functionalitiesInjector = require('./functionalitiesInjector');

module.exports = function registerControllers(domainInstances) {
  const injectors = [
    // here goes the injectors.
    usersInjector,
    rolesInjector,
    functionalitiesInjector,
  ];

  return injectors
    .map((registerController) => registerController(domainInstances))
    .reduce((acc, b) => {
      acc[b.name] = b;
      return acc;
    }, {});
};
