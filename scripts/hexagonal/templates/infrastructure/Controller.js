const createInjection = (modules) => {
  return modules
    .map(
      (x) => `
    ${x.case},`,
    )
    .join('');
};

const createCases = (modules) => {
  return modules
    .map(
      (x) => `
    this.${x.case} = ${x.case};`,
    )
    .join('');
};

const createFunctions = (modules) => {
  return modules
    .map((x) => {
      return `
  ${x.function}`;
    })
    .join('');
};

module.exports = (
  { singularSC, pluralPC, pluralCC, singularPC },
  use_cases,
) => {
  const modules = [
    {
      value: 'paginate',
      case: `get${pluralPC}PaginableList`,
      function: `async index({ query }, res, next) {
    try {
      const { page, per_page, sort_by, sort_dir, ...filters } = query;
      const pagerOpts = { page, per_page, sort_by, sort_dir };

      const result = await this.get${pluralPC}PaginableList.execute({
        pagerOpts,
        filters,
      });

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
`,
    },
    {
      value: 'list',
      case: `get${pluralPC}List`,
      function: `async list(req, res, next) {
    try {
      const result = await this.get${pluralPC}List.execute();

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
`,
    },
    {
      value: 'show',
      case: `show${singularPC}`,
      function: `async show(req, res, next) {
    try {
      const { ${singularSC}_id } = req.params;

      const result = await this.show${singularPC}.execute({
        ${singularSC}_id,
      });

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
`,
    },
    {
      value: 'create',
      case: `create${singularPC}`,
      function: `async create(req, res, next) {
    try {
      const { column_1, column_2 } = req.body;

      const result = await this.create${singularPC}.execute({
        column_1,
        column_2,
      });

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
`,
    },
    {
      value: 'update',
      case: `update${singularPC}`,
      function: `async update(req, res, next) {
    try {
      const { ${singularSC}_id } = req.params;
      const { column_1, column_2 } = req.body;

      const result = await this.update${singularPC}.execute({
        ${singularSC}_id,
        column_1,
        column_2,
      });

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
`,
    },
    {
      value: 'delete',
      case: `delete${singularPC}`,
      function: `async delete(req, res, next) {
    try {
      const { ${singularSC}_id } = req.params;

      const result = await this.delete${singularPC}.execute({
        ${singularSC}_id,
      });

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
`,
    },
  ].filter((x) => use_cases.includes(x.value));

  return `const { getResponseCustom } = require('../libs/serviceUtil');

class ${pluralPC}Controller {
  constructor({${createInjection(modules)}
  }) {
    this.name = '${pluralCC}Controller';${createCases(modules)}
  }
${createFunctions(modules)}
}

module.exports = ${pluralPC}Controller;
`;
};
