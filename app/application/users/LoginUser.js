const CustomError = require("../../domain/exceptions/CustomError");

class LoginUser {
  constructor({ usersRepository, validator, jwt }) {
    this.$user = usersRepository;
    this.validator = validator;
    this.jwt = jwt;
  }

  async execute({ email, password }) {
    await this.validateLogin({ email, password });

    const user = await this.$user.getUserByEmail({ email });
    if (!this.$user.checkPassword({ password, user_password: user.password })) {
      throw new CustomError("User or password is incorrect", 412);
    }

    const userRes = {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };

    return {
      user: userRes,
      token: this.jwt.generateAccessToken(userRes),
    };
  }

  validateLogin({ email, password }) {
    return this.validator(
      {
        email,
        password,
      },
      {
        email: "required|email",
        password: "required",
      },
      {
        "required.email": "Please send an Email",
        "email.email": "Email sent is invalid",
        "required.password": "Please send a password",
      }
    );
  }
}

module.exports = LoginUser;
