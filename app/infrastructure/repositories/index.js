const TransactionRepository = require("./_db_transaction.repository");
const UsersRepository = require("./users.repository");
const RolesRepository = require('./roles.repository');
const FunctionalitiesRepository = require('./functionalities.repository');
const MailerRepository = require("./mailer.repository");

module.exports = {
  TransactionRepository,
  UsersRepository,
  RolesRepository,
  FunctionalitiesRepository,
  MailerRepository,
};
