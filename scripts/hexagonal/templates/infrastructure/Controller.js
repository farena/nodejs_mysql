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
    .map((x) => {
      if (Array.isArray(x.case)) {
        return x.case
          .map(
            (y) => `
    this.${y} = ${y};`,
          )
          .join('\n    ');
      }

      return `
    this.${x.case} = ${x.case};`;
    })
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
  { pluralPC, pluralCC, singularPC, singularSC },
  use_cases,
  fields,
) => {
  const modules = [
    {
      value: 'paginate_list',
      case: [`get${pluralPC}PaginableList`, `get${pluralPC}List`],
      function: `async index({ query }, res, next) {
    try {
      const { page, per_page, sort_by, sort_dir, list, ...filters } = query;
      const pagerOpts = { page, per_page, sort_by, sort_dir };

      let result;
      if(!list) {
        result = await this.get${pluralPC}PaginableList.execute({
          pagerOpts,
          filters,
        });
      } else {
        result = await this.get${pluralPC}List.execute();
      }

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
`,
    },
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
      function: `async index(req, res, next) {
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
      const { ${fields.map((field) => field.name).join(', ')} } = req.body;

      const result = await this.create${singularPC}.execute({
        ${fields.map((field) => field.name).join(',\n      ')},
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
      const { ${fields.map((field) => field.name).join(', ')} } = req.body;

      const result = await this.update${singularPC}.execute({
        ${singularSC}_id,
        ${fields.map((field) => field.name).join(',\n      ')},
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
    {
      value: 'soft_delete',
      case: `deactivate${singularPC}`,
      function: `async deactivate(req, res, next) {
    try {
      const { ${singularSC}_id } = req.params;

      const result = await this.deactivate${singularPC}.execute({
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
      value: 'soft_delete',
      case: `activate${singularPC}`,
      function: `async activate(req, res, next) {
    try {
      const { ${singularSC}_id } = req.params;

      const result = await this.activate${singularPC}.execute({
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
  ].filter((x) => {
    const hasPagList =
      use_cases.includes('paginate') && use_cases.includes('list');

    if (hasPagList) {
      if (x.value === 'paginate_list') return true;
      if (x.value === 'paginate') return false;
      if (x.value === 'list') return false;
    }

    return use_cases.includes(x.value);
  });

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
