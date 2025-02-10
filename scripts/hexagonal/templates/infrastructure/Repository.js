const createFunctions = (modules) => {
  return modules.map((x) => `${x.function}`).join('');
};

module.exports = ({ singularSC, pluralPC, pluralSC }, use_cases) => {
  const modules = [
    {
      value: 'paginate',
      function: `

  async paginate({ pagerOpts, filters }) {
    const where = {};
    if(filters.search) {
      where.name = { [Op.like]: \`%\${filters.search}%\` }
    }

    const ${pluralSC} = await this.models.${singularSC}.findAndCountAll(
      paginate(
        {
          order: [['${singularSC}_id', 'asc']],
          where,
        },
        pagerOpts,
      ),
    );

    return paginatedResult(${pluralSC}, pagerOpts);
  }`,
    },
    {
      value: 'list',
      function: `

  async list() {
    const ${pluralSC} = await this.models.${singularSC}.findAll({
      order: [['name', 'asc']],
    });

    return ${pluralSC};
  }`,
    },
    {
      value: 'show',
      function: `

  async show({ ${singularSC}_id }) {
    const ${singularSC} = await this.models.${singularSC}.findByPk(${singularSC}_id);

    if (!${singularSC}) throw new CustomError('${singularSC} not found', 404);

    return ${singularSC};
  }`,
    },
    {
      value: 'create',
      function: `

  async create({ column_1, column_2 }) {
    const ${singularSC} = await this.models.${singularSC}.create({
      column_1, column_2,
    });

    return ${singularSC};
  }`,
    },
    {
      value: 'update',
      function: `

  async update({ ${singularSC}_id, column_1, column_2 }) {
    const ${singularSC} = await this.models.${singularSC}.findByPk(${singularSC}_id);

    if (!${singularSC}) throw new CustomError('${singularSC} not found', 404);

    await ${singularSC}.update({
      column_1,
      column_2,
    });

    return {
      ...${singularSC}.toJSON(),
      column_1,
      column_2,
    };
  }`,
    },
    {
      value: 'delete',
      function: `

  async delete({ ${singularSC}_id }) {
    const ${singularSC} = await this.models.${singularSC}.findByPk(${singularSC}_id);

    if (!${singularSC}) throw new CustomError('${singularSC} not found', 404);

    await ${singularSC}.destroy();

    return ${singularSC};
  }`,
    },
  ].filter((x) => use_cases.includes(x.value));

  const withPaginate = use_cases.includes('paginate');

  return `const { Op } = require('sequelize');${
    withPaginate
      ? `
      const { paginate, paginatedResult } = require('../libs/paginable');
`
      : ''
  }const CustomError = require('../../domain/exceptions/CustomError');

class ${pluralPC}Repository {
  constructor(models) {
    this.models = models;
  }${createFunctions(modules)}
}

module.exports = ${pluralPC}Repository;
`;
};
