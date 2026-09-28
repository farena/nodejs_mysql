const { v4 } = require("uuid");
const CustomError = require("../../domain/exceptions/CustomError");

class SendPasswordReset {
  constructor(usersRepository, mailerRepository, settings) {
    this.$user = usersRepository;
    this.$mailer = mailerRepository;
    this.domain = settings.domain;
  }

  async execute({ email }) {
    if (!email) throw new CustomError("Please send an email", 412);

    const user = await this.$user.getUserByEmail({
      email,
    });

    // Same response for unknown emails, to avoid leaking which ones exist
    if (!user) return "Email sent succesfully";

    const reset_code = v4();

    await this.$user.update({
      user_id: user.user_id,
      reset_code,
    });

    await this.$mailer.sendMail({
      email_template_id: this.$mailer.TEMPLATES.PASSWORD_RESET,
      data: {
        user_name: user.fullname,
        reset_link: `${this.domain}/reset_password/${reset_code}`,
      },
      to: user.email,
    });

    return "Email sent succesfully";
  }
}

module.exports = SendPasswordReset;
