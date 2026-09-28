const { Op } = require("sequelize");
const { paginate, paginatedResult } = require("../libs/paginable");
const CustomError = require("../../domain/exceptions/CustomError");

class RolesRepository {
  constructor(models) {
    this.models = models;
  }

  async paginate({ pagerOpts, filters }) {
    const where = {};
    if (filters.search) {
      where.name = { [Op.like]: `%${filters.search}%` };
    }

    const roles = await this.models.role.findAndCountAll(
      paginate(
        {
          order: [["role_id", "asc"]],
          where,
        },
        pagerOpts
      )
    );

    return paginatedResult(roles, pagerOpts);
  }

  async list() {
    const roles = await this.models.role.findAll({
      order: [["name", "asc"]],
    });

    return roles;
  }

  async create({ name, transaction }) {
    const role = await this.models.role.create(
      {
        name,
      },
      {
        transaction,
      }
    );

    return role;
  }

  async update({ role_id, name, transaction }) {
    const role = await this.models.role.findByPk(role_id, {
      include: "functionalities",
      transaction,
    });

    if (!role) throw new CustomError("Role not found", 404);

    await role.update(
      {
        name,
      },
      { transaction }
    );

    return {
      ...role.toJSON(),
      name,
    };
  }

  async upsertFunctionalities({
    role_id,
    funcs = [],
    prev_funcs = [],
    transaction,
  }) {
    const existingFns = prev_funcs.map((x) => x.functionality_id);
    const newFns = funcs.map((x) => x.functionality_id);
    const toDel = existingFns.filter((x) => !newFns.includes(x));

    if (toDel.length > 0) {
      await this.models.functionality_role.destroy({
        transaction,
        where: {
          role_id,
          functionality_id: { [Op.in]: toDel },
        },
      });
    }

    if (newFns.length > 0) {
      await this.models.functionality_role.bulkCreate(
        funcs.map(({ functionality_id, type }) => ({
          role_id,
          functionality_id,
          type,
        })),
        {
          transaction,
          updateOnDuplicate: ["type"],
        }
      );
    }
  }

  async delete({ role_id }) {
    const role = await this.models.role.findByPk(role_id);
    if (!role) throw new CustomError("Role not found", 404);

    const count = await this.models.user.count({
      where: { role_id },
    });
    if (count > 0)
      throw new CustomError("Role has related users, cannot delete", 412);

    await this.models.functionality_role.destroy({
      where: {
        role_id,
      },
    });
    await role.destroy();

    return role;
  }
}

module.exports = RolesRepository;
