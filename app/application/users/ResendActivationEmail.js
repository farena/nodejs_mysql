class ResendActivationEmail {
  constructor(usersRepository, mailerRepository, settings) {
    this.$user = usersRepository;
    this.$mailer = mailerRepository;
    this.domain = settings.domain;
  }

  async execute({ user_id }) {
    const user = await this.$user.getUserById({
      user_id,
    });

    await this.$mailer.sendMail({
      to: user.email,
      email_template_id: this.$mailer.TEMPLATES.USER_ACTIVATION,
      data: {
        user_name: user.fullname,
        activation_link: `${this.domain}/activate_user/${user.verification_code}`,
        activation_button: `<a href="${this.domain}/activate_user/${user.verification_code}" style="width: 100%; text-align: center; font-weight: 600;">Activate Account</a>`,
      },
    });

    return "Email sent succesfully";
  }
}

module.exports = ResendActivationEmail;
