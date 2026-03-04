const createFunctions = (modules) => {
  return modules.map((x) => `${x.function}`).join('');
};

module.exports = (
  { singularSC, singularPC, pluralPC, pluralSC },
  use_cases,
  fields,
) => {
  const soft_delete = use_cases.includes('soft_delete');
  const modules = [
    {
      value: 'paginate',
      function: `

  async paginate({ pagerOpts, filters }) {
    const where = {${
      soft_delete
        ? `\n      deleted_at: filters.show_deleted ? null : { [Op.not]: null },
    `
        : ''
    }};
    if(filters.search) {
      where.name = { [Op.like]: \`%\${filters.search}%\` };
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
      order: [['name', 'asc']],${
        soft_delete
          ? `
      where: {
        deleted_at: null,
      },`
          : ''
      }
    });

    return ${pluralSC};
  }`,
    },
    {
      value: 'show',
      function: `

  async show({ ${singularSC}_id }) {
    const ${singularSC} = await this.models.${singularSC}.findByPk(${singularSC}_id${
        soft_delete
          ? `, {
      where: {
        deleted_at: null,
      },
    }`
          : ''
      });

    if (!${singularSC}) throw new CustomError('${singularSC} not found', 404);

    return ${singularSC};
  }`,
    },
    {
      value: 'create',
      function: `

  async create({ ${fields.map((field) => field.name).join(', ')} }) {
    const ${singularSC} = await this.models.${singularSC}.create({
      ${fields.map((field) => field.name).join(',\n      ')},
    });

    return ${singularSC};
  }`,
    },
    {
      value: 'update',
      function: `

  async update({ ${singularSC}_id, ${fields
        .map((field) => field.name)
        .join(', ')} }) {
    const ${singularSC} = await this.models.${singularSC}.findByPk(${singularSC}_id${
        soft_delete
          ? `, {
      where: {
        deleted_at: null,
      },
    }`
          : ''
      });

    if (!${singularSC}) throw new CustomError('${singularPC} not found', 404);

    await ${singularSC}.update({
      ${fields.map((field) => field.name).join(',\n      ')},
    });

    return {
      ...${singularSC}.toJSON(),
      ${fields.map((field) => field.name).join(',\n      ')},
    };
  }`,
    },
    {
      value: 'delete',
      function: `

  async delete({ ${singularSC}_id }) {
    const ${singularSC} = await this.models.${singularSC}.findByPk(${singularSC}_id${
        soft_delete
          ? `, {
      where: {
        deleted_at: null,
      },
    }`
          : ''
      });

    if (!${singularSC}) throw new CustomError('${singularPC} not found', 404);

    await ${singularSC}.destroy();

    return ${singularSC};
  }`,
    },
    {
      value: 'soft_delete',
      function: `

  async deactivate({ ${singularSC}_id }) {
    const ${singularSC} = await this.models.${singularSC}.findByPk(${singularSC}_id);

    if (!${singularSC}) throw new CustomError('${singularPC} not found', 404);

    await ${singularSC}.update({
      deleted_at: new Date(),
    });

    return ${singularSC};
  }`,
    },
    {
      value: 'soft_delete',
      function: `

  async activate({ ${singularSC}_id }) {
    const ${singularSC} = await this.models.${singularSC}.findByPk(${singularSC}_id);

    if (!${singularSC}) throw new CustomError('${singularPC} not found', 404);

    await ${singularSC}.update({
      deleted_at: null,
    });

    return ${singularSC};
  }`,
    },
  ].filter((x) => {
    return use_cases.includes(x.value);
  });

  const withPaginate = use_cases.includes('paginate');

  return `const { Op } = require('sequelize');${
    withPaginate
      ? `\nconst { paginate, paginatedResult } = require('../libs/paginable');\n`
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
