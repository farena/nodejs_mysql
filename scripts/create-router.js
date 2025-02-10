const fs = require('fs');
const path = require('path');

module.exports = ({ pluralCC, pluralSC, singularSC }, use_cases) => {
  let template = `const express = require('express');

const router = express.Router();

const authMiddleware = require('../infrastructure/middlewares/auth.middleware');
const routeACL = require('../infrastructure/middlewares/acl.middleware');
`;

  if (use_cases.includes('paginate') || use_cases.includes('list')) {
    template += `

router.get(
  '/', [
    authMiddleware,
    routeACL('${pluralSC}.index'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.index(req, res, next),
);`;
  }

  if (use_cases.includes('create')) {
    template += `
    
router.post(
  '/', 
  [
    authMiddleware,
    routeACL('${pluralSC}.create'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.create(req, res, next),
);`;
  }

  if (use_cases.includes('show')) {
    template += `
    
router.get(
  '/:${singularSC}_id', 
  [
    authMiddleware,
    routeACL('${pluralSC}.show'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.show(req, res, next),
);`;
  }

  if (use_cases.includes('update')) {
    template += `
    
router.put(
  '/:${singularSC}_id', 
  [
    authMiddleware,
    routeACL('${pluralSC}.update'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.update(req, res, next),
);`;
  }

  if (use_cases.includes('delete')) {
    template += `
    
router.delete(
  '/:${singularSC}_id', 
  [
    authMiddleware,
    routeACL('${pluralSC}.delete'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.delete(req, res, next),
);`;
  }

  template += `
    
module.exports = {
  basePath: '/${pluralSC}',
  router,
};
`;

  const relPath = path.resolve(
    __dirname,
    `../app/routes/${pluralSC}.router.js`,
  );

  if (fs.existsSync(relPath))
    throw new Error(`There is already a router in path: ${relPath}`);

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(`Route created in /app/routes/${pluralSC}.router.js`);
    }
  });
};
