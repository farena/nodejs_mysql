const fs = require('fs');
const path = require('path');

module.exports = (name, pluralName, utils_dir) => {
  const camelCaseName = pluralName.split('_').map((x) => `${x[0].toUpperCase()}${x.slice(1)}`).join('');

  const template = `const models = require('../models');
const response = require('${utils_dir}/serviceUtil.js');
const paginable = require('${utils_dir}/paginable.js');
const CustomError = require('${utils_dir}/CustomError.js');

module.exports = {
  name: '${camelCaseName}Controller',

  index: async (req, res, next) => {
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const ${pluralName} = await models.${name}.findAndCountAll(
          paginable.paginate(
            {
              transaction,
            },
            req.query,
          ),
        );
        return ${pluralName};
      });
      // Transaction complete!
      res.status(200).send(paginable.paginatedResponse(result, req.query));
      res.end();
    } catch (error) {
    // Transaction Failed!
      next(error);
    }
  },

  show: async (req, res, next) => {
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const ${name} = await models.${name}.findByPk(req.params.${name}_id, {
          transaction,
        });

        if (!${name}) throw new CustomError('${name} not found', 404);

        return ${name};
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
    // Transaction Failed!
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const ${name} = await models.${name}.create({
          // CREATE ATTRIBUTES
        }, { transaction });

        return ${name};
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
    // Transaction Failed!
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const ${name} = await models.${name}.findByPk(req.params.${name}_id, {
          transaction,
        });

        if (!${name}) throw new CustomError('${name} not found', 404);

        // UPDATE ATTRIBUTES
        await ${name}.save({ transaction });

        return ${name};
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
    // Transaction Failed!
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const ${name} = await models.${name}.findByPk(req.params.${name}_id, {
          transaction,
        });

        if (!${name}) throw new CustomError('${name} not found', 404);

        await ${name}.destroy({ transaction });

        return ${name};
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
    // Transaction Failed!
      next(error);
    }
  },
};
`;

  const relPath = path.resolve(__dirname, `../app/controllers/${pluralName}.controller.js`);

  if (fs.existsSync(relPath)) throw new Error(`There is already a controller in path: ${relPath}`);

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(`Controller created in /app/controllers/${pluralName}.controller.js`);
    }
  });
};
