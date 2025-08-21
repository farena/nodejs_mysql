const validate = require('../libs/validate');

const { RolesRepository } = require('../repositories');
const {
  GetRolesPaginableList,
  GetRolesList,
  CreateRole,
  UpdateRole,
  DeleteRole,
  ValidateRoleData,
} = require('../../application/roles');
const RolesController = require('../controllers/RolesController');

module.exports = function registerController({ models }) {
  const rolesRepository = new RolesRepository(models);

  const validateRoleData = new ValidateRoleData(validate);
  const getRolesPaginableList = new GetRolesPaginableList(rolesRepository);
  const getRolesList = new GetRolesList(rolesRepository);
  const createRole = new CreateRole(rolesRepository, validateRoleData);
  const updateRole = new UpdateRole(rolesRepository, validateRoleData);
  const deleteRole = new DeleteRole(rolesRepository);

  return new RolesController({
    getRolesPaginableList,
    getRolesList,
    createRole,
    updateRole,
    deleteRole,
  });
};
