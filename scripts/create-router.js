const fs = require('fs');
const path = require('path');

module.exports = (name, pluralName) => {
  const camelCaseName = pluralName.split('_').map((x) => `${x[0].toUpperCase()}${x.slice(1)}`).join('');

  const template = `const express = require('express');

const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth.js');

router.get('/', [
  authMiddleware,
], controllers.${camelCaseName}Controller.index);

router.post('/', [
  authMiddleware,
], controllers.${camelCaseName}Controller.create);

router.get('/:${name}_id', [
  authMiddleware,
], controllers.${camelCaseName}Controller.show);

router.put('/:${name}_id', [
  authMiddleware,
], controllers.${camelCaseName}Controller.update);

router.delete('/:${name}_id', [
  authMiddleware,
], controllers.${camelCaseName}Controller.delete);

module.exports = {
  basePath: '/${pluralName}',
  router,
};
`;

  const relPath = path.resolve(__dirname, `../app/routes/${name}.router.js`);

  if (fs.existsSync(relPath)) throw new Error(`There is already a router in path: ${relPath}`);

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(`Route created in /app/routes/${name}.router.js`);
    }
  });
};
