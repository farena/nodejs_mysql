const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const routes = [];

// Initializing routes
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-9) === 'router.js',
  )
  .forEach((file) => {
    const routeGroup = require(path.join(__dirname, file));
    routes.push(routeGroup);
  });

module.exports = routes;
