const importValidator = (withValidate) => {
  return withValidate
    ? `const validate = require('../libs/validate');

`
    : '';
};
const createImports = (modules) => {
  return modules.map((x) => `${x.import}`).join('');
};
const createInstances = (modules) => {
  return modules
    .sort((a, b) => (a.instance_order < b.instance_order ? -1 : 1))
    .map((x) => `${x.instance}`)
    .join('');
};
const createInjections = (modules) => {
  return modules
    .filter((x) => x.injection)
    .map((x) => `${x.injection}`)
    .join('');
};

module.exports = ({ singularPC, pluralCC, pluralPC, pluralSC }, use_cases) => {
  const withValidate = use_cases.includes('validate');
  const modules = [
    {
      value: 'paginate',
      import: `
  Get${pluralPC}PaginableList,`,
      instance: `
  const get${pluralPC}PaginableList = new Get${pluralPC}PaginableList(${pluralCC}Repository);`,
      instance_order: 2,
      injection: `
    get${pluralPC}PaginableList,`,
    },
    {
      value: 'list',
      import: `
  Get${pluralPC}List,`,
      instance: `
  const get${pluralPC}List = new Get${pluralPC}List(${pluralCC}Repository);`,
      instance_order: 3,
      injection: `
    get${pluralPC}List,`,
    },
    {
      value: 'show',
      import: `
  Show${singularPC},`,
      instance: `
  const show${singularPC} = new Show${singularPC}(${pluralCC}Repository);`,
      instance_order: 5,
      injection: `
    show${singularPC},`,
    },
    {
      value: 'create',
      import: `
  Create${singularPC},`,
      instance: `
  const create${singularPC} = new Create${singularPC}(${pluralCC}Repository${
        withValidate ? `, validate${singularPC}Data` : ''
      });`,
      instance_order: 4,
      injection: `
    create${singularPC},`,
    },
    {
      value: 'update',
      import: `
  Update${singularPC},`,
      instance: `
  const update${singularPC} = new Update${singularPC}(${pluralCC}Repository${
        withValidate ? `, validate${singularPC}Data` : ''
      });`,
      instance_order: 6,
      injection: `
    update${singularPC},`,
    },
    {
      value: 'delete',
      import: `
  Delete${singularPC},`,
      instance: `
  const delete${singularPC} = new Delete${singularPC}(${pluralCC}Repository);`,
      instance_order: 7,
      injection: `
    delete${singularPC},`,
    },
    {
      value: 'validate',
      import: `
  Validate${singularPC}Data,`,
      instance: `
  const validate${singularPC}Data = new Validate${singularPC}Data(validate);`,
      instance_order: 1,
    },
  ].filter((x) => use_cases.includes(x.value));

  return `${importValidator(
    withValidate,
  )}const { ${pluralPC}Repository } = require('../repositories');
const {${createImports(modules)}
} = require('../../application/${pluralSC}');
const ${pluralPC}Controller = require('../controllers/${pluralPC}Controller');

module.exports = function registerController({ models }) {
  const ${pluralCC}Repository = new ${pluralPC}Repository(models);
${createInstances(modules)}

  return new ${pluralPC}Controller({${createInjections(modules)}
  });
};
`;
};
