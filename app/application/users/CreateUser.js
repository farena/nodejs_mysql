class CreateUser {
  constructor(
    usersRepository,
    transactionsRepository,
    mailerRepository,
    ValidateUserData,
    settings
  ) {
    this.$user = usersRepository;
    this.$transaction = transactionsRepository;
    this.$mailer = mailerRepository;
    this.$validator = ValidateUserData;
    this.domain = settings.domain;
  }

  async execute({ first_name, last_name, email, role_id }) {
    await this.$validator.execute({
      first_name,
      last_name,
      email,
      role_id,
    });

    return this.$transaction.handleTransaction(async (transaction) => {
      const user = await this.$user.create({
        first_name,
        last_name,
        email,
        role_id,
        transaction,
      });

      await this.$mailer.sendMail({
        transaction,
        email_template_id: this.$mailer.TEMPLATES.USER_ACTIVATION,
        data: {
          user_name: user.fullname,
          activation_link: `${this.domain}/activate_user/${user.verification_code}`,
          activation_button: `<a href="${this.domain}/activate_user/${user.verification_code}" style="width: 100%; text-align: center; font-weight: 600;">Activate Account</a>`,
        },
        to: user.email,
      });

      return "User created succesfully";
    });
  }
}

module.exports = CreateUser;
