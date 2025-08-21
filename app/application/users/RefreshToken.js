const moment = require("moment");
const CustomError = require("../../domain/exceptions/CustomError");

class RefreshToken {
  constructor(usersRepository, usersHelper, jwt, settings) {
    this.$user = usersRepository;
    this.$helper = usersHelper;
    this.$jwt = jwt;
    this.settings = settings;
  }

  async execute({ refresh_token }) {
    const { user_id } = await this.$jwt.verifyRefreshToken(refresh_token);

    const user = await this.$user.getUserById({
      user_id,
      include: [
        {
          association: "role",
          include: [
            {
              association: "functionalities",
              include: "endpoints",
            },
            {
              association: "permissions",
              required: false,
            },
          ],
        },
      ],
    });

    if (!user) throw new CustomError("Incorrect User or Password", 401);

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
}

module.exports = RefreshToken;
