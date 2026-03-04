const { uuid } = require("uuidv4");
const paginable = require("../libs/paginable");
const CustomError = require("../../domain/exceptions/CustomError");

class UsersRepository {
  constructor(models) {
    this.models = models;
  }

  async getUserByEmail({ email, include, transaction }) {
    return this.models.user.findOne({
      transaction,
      where: {
        email,
      },
      include,
    });
  }

  async getUserById({ user_id, include, transaction, password = true }) {
    const scopes = [];

    if (!password) scopes.push("noPassword");

    return this.models.user.scope(scopes).findOne({
      transaction,
      where: {
        user_id,
      },
      include,
    });
  }

  async getUserByVerificationCode({ verification_code, transaction }) {
    const user = await this.models.user.findOne({
      transaction,
      where: {
        verification_code,
      },
    });

    if (!user) throw new CustomError("Verfication code is invalid", 412);

    return user;
  }

  async getUserByResetCode({ reset_code, transaction }) {
    const user = await this.models.user.findOne({
      transaction,
      where: {
        reset_code,
      },
    });

    if (!user) throw new CustomError("Reset code is invalid", 412);

    return user;
  }

  async paginate({ pagerOpts, filters }) {
    const where = {};
    if (filters.active && filters.active !== "all") {
      where.is_active = filters.active === "true";
    }

    const users = await this.models.user
      .scope(["noPassword", { method: ["search", { value: filters.search }] }])
      .findAndCountAll(
        paginable.paginate(
          {
            where,
          },
          pagerOpts
        )
      );

    return paginable.paginatedResult(users, pagerOpts);
  }

  async list() {
    const users = await this.models.user.scope("noPassword").findAll({
      order: [["first_name", "asc"]],
      where: {
        is_active: true,
      },
    });

    return users;
  }

  async create({ first_name, last_name, email, role_id, transaction }) {
    return this.models.user.create(
      {
        first_name,
        last_name,
        email,
        role_id,
        password: uuid(),
        is_active: false,
        verification_code:
          Math.random().toString(36).slice(2) +
          Math.random().toString(36).slice(2),
      },
      {
        transaction,
      }
    );
  }

  async update({
    user_id,
    first_name,
    last_name,
    email,
    password,
    reset_code,
    verification_code,
    is_active,
    last_login,
    transaction,
  }) {
    const toUpd = {};
    if (first_name) toUpd.first_name = first_name;
    if (last_name) toUpd.last_name = last_name;
    if (email) toUpd.email = email;
    if (password) toUpd.password = password;
    if (reset_code !== undefined) toUpd.reset_code = reset_code;
    if (last_login) toUpd.last_login = last_login;
    if (verification_code !== undefined)
      toUpd.verification_code = verification_code;
    if (is_active !== undefined) toUpd.is_active = is_active;

    return this.models.user.update(toUpd, {
      transaction,
      where: {
        user_id,
      },
    });
  }
}

module.exports = UsersRepository;
