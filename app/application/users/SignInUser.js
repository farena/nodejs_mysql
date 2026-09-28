const moment = require("moment");
const CustomError = require("../../domain/exceptions/CustomError");

class SignInUser {
  constructor(usersRepository, usersHelper, jwt, settings) {
    this.$user = usersRepository;
    this.$helper = usersHelper;
    this.$jwt = jwt;
    this.settings = settings;
  }

  async execute({ email, password }) {
    this.constructor.validate({ email, password });

    const user = await this.$user.getUserByEmail({
      email,
      include: [
        {
          association: "role",
          include: [
            {
              association: "functionalities",
              include: "endpoints",
            },
          ],
        },
      ],
    });

    if (!user) throw new CustomError("Incorrect User or Password", 401);

    this.$helper.checkPassword({
      password,
      user_password: user.password,
    });

    if (!user.is_active) {
      throw new CustomError(
        "The User is inactive, please contact your administrator",
        401
      );
    }

    await this.$user.update({
      user_id: user.user_id,
      last_login: moment(),
    });

    return this.$helper.parseAuthenticatedResponse({
      user,
      jwt: this.$jwt,
      settings: this.settings,
    });
  }

  static validate({ email, password }) {
    if (!email) throw new CustomError("Please send an email", 412);
    if (!password) throw new CustomError("Please send a password", 412);
  }
}

module.exports = SignInUser;
