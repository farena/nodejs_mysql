/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

module.exports = ({ pluralSC, pluralCC, singularSC }, use_cases) => {
  const modules = [
    {
      value: 'paginate_list',
      template: `router.get(
  '/',
  [
    authMiddleware,
    routeACL('${pluralSC}.index'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.index(req, res, next),
);`,
    },
    {
      value: 'create',
      template: `router.post(
  '/',
  [
    authMiddleware,
    routeACL('${pluralSC}.create'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.create(req, res, next),
);`,
    },
    {
      value: 'show',
      template: `router.get(
  '/:${singularSC}_id',
  [
    authMiddleware,
    routeACL('${pluralSC}.show'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.show(req, res, next),
);`,
    },
    {
      value: 'update',
      template: `router.put(
  '/:${singularSC}_id',
  [
    authMiddleware,
    routeACL('${pluralSC}.update'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.update(req, res, next),
);`,
    },
    {
      value: 'delete',
      template: `router.delete(
  '/:${singularSC}_id',
  [
    authMiddleware,
    routeACL('${pluralSC}.destroy'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.delete(req, res, next),
);`,
    },
    {
      value: 'soft_delete',
      template: `router.put(
  '/:${singularSC}_id/deactivate',
  [
    authMiddleware,
    routeACL('${pluralSC}.deactivate'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.deactivate(req, res, next),
);`,
    },
    {
      value: 'soft_delete',
      template: `router.put(
  '/:${singularSC}_id/activate',
  [
    authMiddleware,
    routeACL('${pluralSC}.activate'),
  ],
  (req, res, next) => req.controllers.${pluralCC}Controller.activate(req, res, next),
);`,
    },
  ].filter((x) => {
    const hasPagList =
      use_cases.includes('paginate') || use_cases.includes('list');

    if (hasPagList) {
      if (x.value === 'paginate_list') return true;
    }

    return use_cases.includes(x.value);
  });

  const template = `const express = require('express');

const router = express.Router();
const authMiddleware  = require("../infrastructure/middlewares/auth.middleware");
const routeACL = require("../infrastructure/middlewares/acl.middleware");

${modules.map((x) => x.template).join('\n\n')}

module.exports = {
  basePath: '/${pluralSC}',
  router,
};
`;

  const relPath = path.resolve(
    __dirname,
    `../../app/routes/${pluralSC}.router.js`,
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
