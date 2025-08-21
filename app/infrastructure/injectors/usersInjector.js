const validate = require("../libs/validate");
const {
  UsersRepository,
  TransactionRepository,
  MailerRepository,
} = require("../repositories");
const {
  VerifyUser,
  CreateUser,
  DeactivateUser,
  ActivateUser,
  GetUsersList,
  ResendActivationEmail,
  ShowUser,
  SignInUser,
  RefreshToken,
  UpdateUser,
  UpdateUserProfile,
  ValidateUserData,
  SendPasswordReset,
  ResetUserPassword,
  GetUsersPaginableList,
} = require("../../application/users");
const UsersController = require("../controllers/UsersController");
const UsersHelper = require("../../domain/helpers/users.helper");

module.exports = function registerController({
  models,
  mailer,
  jwt,
  settings,
}) {
  const usersRepository = new UsersRepository(models);
  const transactionsRepository = new TransactionRepository(models);
  const mailerRepository = new MailerRepository(mailer, models);

  const validateUserData = new ValidateUserData(validate);

  const verifyUser = new VerifyUser(usersRepository, validateUserData);
  const createUser = new CreateUser(
    usersRepository,
    transactionsRepository,
    mailerRepository,
    validateUserData,
    settings
  );
  const activateUser = new ActivateUser(usersRepository);
  const deactivateUser = new DeactivateUser(usersRepository);
  const getUsersList = new GetUsersList(usersRepository);
  const getUsersPaginableList = new GetUsersPaginableList(usersRepository);
  const resendActivationEmail = new ResendActivationEmail(
    usersRepository,
    mailerRepository,
    settings
  );
  const showUser = new ShowUser(usersRepository);

  const signInUser = new SignInUser(
    usersRepository,
    UsersHelper,
    jwt,
    settings
  );
  const refreshToken = new RefreshToken(
    usersRepository,
    UsersHelper,
    jwt,
    settings
  );
  const updateUser = new UpdateUser(
    usersRepository,
    transactionsRepository,
    validateUserData
  );
  const updateUserProfile = new UpdateUserProfile(
    usersRepository,
    validateUserData,
    UsersHelper
  );
  const sendPasswordReset = new SendPasswordReset(
    usersRepository,
    mailerRepository,
    settings
  );
  const resetUserPassword = new ResetUserPassword(usersRepository, validate);

  return new UsersController({
    verifyUser,
    createUser,
    activateUser,
    deactivateUser,
    getUsersList,
    getUsersPaginableList,
    resendActivationEmail,
    showUser,
    signInUser,
    refreshToken,
    updateUser,
    updateUserProfile,
    validateUserData,
    sendPasswordReset,
    resetUserPassword,
  });
};
