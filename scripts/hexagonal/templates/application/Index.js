const createImports = (modules) => {
  return modules
    .map((x) => {
      return `const ${x.name} = require('./${x.name}');
`;
    })
    .join('');
};
const createExports = (modules) => {
  return modules
    .map(
      (x) => `
  ${x.name},`,
    )
    .join('');
};

module.exports = ({ pluralPC, singularPC }, use_cases) => {
  const modules = [
    {
      name: `Get${pluralPC}PaginableList`,
      value: 'paginate',
    },
    {
      name: `Get${pluralPC}List`,
      value: 'list',
    },
    {
      name: `Create${singularPC}`,
      value: 'create',
    },
    {
      name: `Show${singularPC}`,
      value: 'show',
    },
    {
      name: `Update${singularPC}`,
      value: 'update',
    },
    {
      name: `Delete${singularPC}`,
      value: 'delete',
    },
    {
      name: `Validate${singularPC}Data`,
      value: 'validate',
    },
  ].filter((x) => use_cases.includes(x.value));

  return `${createImports(modules)}
module.exports = {${createExports(modules)}
};
  `;
};
