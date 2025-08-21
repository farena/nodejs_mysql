const { getResponseCustom } = require("../libs/serviceUtil");

class RolesController {
  constructor({
    getRolesPaginableList,
    getRolesList,
    createRole,
    updateRole,
    deleteRole,
  }) {
    this.name = "rolesController";
    this.getRolesPaginableList = getRolesPaginableList;

    this.getRolesList = getRolesList;
    this.createRole = createRole;
    this.updateRole = updateRole;
    this.deleteRole = deleteRole;
  }

  async index({ query }, res, next) {
    try {
      const { page, per_page, sort_by, sort_dir, paginate, ...filters } = query;
      const pagerOpts = { page, per_page, sort_by, sort_dir };

      let result;
      if (paginate) {
        result = await this.getRolesPaginableList.execute({
          pagerOpts,
          filters,
        });
      } else {
        result = await this.getRolesList.execute();
      }

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { name, functionalities } = req.body;

      const result = await this.createRole.execute({
        name,
        functionalities,
      });

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { role_id } = req.params;
      const { name, functionalities } = req.body;

      const result = await this.updateRole.execute({
        role_id,
        name,
        functionalities,
      });

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { role_id } = req.params;

      const result = await this.deleteRole.execute({
        role_id,
      });

      res.status(200).send(getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RolesController;
