const usersInjector = require("./usersInjector");

module.exports = function registerControllers(domainInstances) {
  const injectors = [
    // here goes the injectors.
    usersInjector,
  ];

  return injectors
    .map((registerController) => registerController(domainInstances))
    .reduce((acc, b) => {
      acc[b.name] = b;
      return acc;
    }, {});
};
