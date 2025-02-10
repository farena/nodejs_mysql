const models = require('../../models');
const UsersRepository = require('./UserRepository');

module.exports = {
  usersRepository: new UsersRepository(models),
};
