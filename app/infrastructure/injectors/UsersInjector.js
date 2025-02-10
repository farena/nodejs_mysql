const validator = require('../libs/validate');
const jwt = require('../libs/jwt');
const { usersRepository } = require('../repositories');
const {
  LoginUser,
  UpdateUserProfile,
} = require('../../application/users');

const UsersController = require('../controllers/UsersController');

// INSTANCES
const loginUser = new LoginUser({
  usersRepository,
  validator,
  jwt,
});
const updateUserProfile = new UpdateUserProfile({
  usersRepository,
  validator,
});

const usersController = new UsersController({
  loginUser,
  updateUserProfile,
});

module.exports = {
  usersController,
};
