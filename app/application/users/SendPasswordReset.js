const { uuid: v4 } = require("uuidv4");

class SendPasswordReset {
  constructor(usersRepository, mailerRepository, settings) {
    this.$user = usersRepository;
    this.$mailer = mailerRepository;
    this.domain = settings.domain;
  }

  async execute({ email }) {
    const user = await this.$user.getUserByEmail({
      email,
    });

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
