/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const Index = require('./templates/application/Index');
const GetPaginableList = require('./templates/application/GetPaginableList');
const GetList = require('./templates/application/GetList');
const Create = require('./templates/application/Create');
const Show = require('./templates/application/Show');
const Update = require('./templates/application/Update');
const Delete = require('./templates/application/Delete');
const Validate = require('./templates/application/Validate');
const Activate = require('./templates/application/Activate');
const Deactivate = require('./templates/application/Deactivate');

const createFile = ({ pluralSC }, name, template) => {
  const folder = path.resolve(__dirname, `../../app/application/${pluralSC}`);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  const relPath = path.resolve(
    __dirname,
    `../../app/application/${pluralSC}/${name}.js`,
  );

  if (fs.existsSync(relPath)) {
    throw new Error(`There is already a file in path: ${relPath}`);
  }

  fs.writeFile(relPath, template, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    else {
      console.log(
        `${
          name === 'index' ? 'Use cases exported' : 'Use case created'
        } in /app/application/${pluralSC}/${name}.js`,
      );
    }
  });
};

const createCommonUseCases = (nameVariants, use_cases, fields) => {
  const useCases = [
    {
      name: 'index',
      template: Index(nameVariants, use_cases),
    },
    {
      name: `Get${nameVariants.pluralPC}PaginableList`,
      template: GetPaginableList(nameVariants),
      value: 'paginate',
    },
    {
      name: `Get${nameVariants.pluralPC}List`,
      template: GetList(nameVariants),
      value: 'list',
    },
    {
      name: `Create${nameVariants.singularPC}`,
      template: Create(nameVariants, use_cases, fields),
      value: 'create',
    },
    {
      name: `Show${nameVariants.singularPC}`,
      template: Show(nameVariants),
      value: 'show',
    },
    {
      name: `Update${nameVariants.singularPC}`,
      template: Update(nameVariants, use_cases, fields),
      value: 'update',
    },
    {
      name: `Delete${nameVariants.singularPC}`,
      template: Delete(nameVariants),
      value: 'delete',
    },
    {
      name: `Validate${nameVariants.singularPC}Data`,
      template: Validate(nameVariants, fields),
      value: 'validate',
    },
    {
      name: `Activate${nameVariants.singularPC}`,
      template: Activate(nameVariants),
      value: 'soft_delete',
    },
    {
      name: `Deactivate${nameVariants.singularPC}`,
      template: Deactivate(nameVariants),
      value: 'soft_delete',
    },
  ];

  useCases
    .filter((x) => {
      if (!x.value) return true;
      if (use_cases.includes(x.value)) return true;
      return false;
    })
    .forEach(({ name, template }) => {
      createFile(nameVariants, name, template);
    });
};

module.exports = (nameVariants, use_cases, fields) => {
  createCommonUseCases(nameVariants, use_cases, fields);
};
