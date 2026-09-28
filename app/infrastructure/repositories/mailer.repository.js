const Mailer = require("../libs/mailer");
const CustomError = require("../../domain/exceptions/CustomError");

const TEMPLATES = {
  USER_ACTIVATION: "USER_ACTIVATION",
  PASSWORD_RESET: "PASSWORD_RESET",
};

const TEMPLATE_DATA = {
  [TEMPLATES.USER_ACTIVATION]: {
    subject: "Activate your account",
    html: `
      <p>Hi {{user_name}},</p>
      <p>Your account has been created. Please activate it using the following link:</p>
      <p>{{{activation_button}}}</p>
      <p>{{activation_link}}</p>
    `,
  },
  [TEMPLATES.PASSWORD_RESET]: {
    subject: "Reset your password",
    html: `
      <p>Hi {{user_name}},</p>
      <p>To reset your password please use the following link:</p>
      <p><a href="{{reset_link}}">{{reset_link}}</a></p>
    `,
  },
};

class MailerRepository {
  constructor(mailer, models) {
    this.mailer = mailer;
    this.models = models;
    this.TEMPLATES = TEMPLATES;
  }

  async sendMail({ email_template_id, data = {}, to }) {
    const template = TEMPLATE_DATA[email_template_id];
    if (!template) {
      throw new CustomError(`Email template ${email_template_id} not found`, 500);
    }

    return this.mailer.sendMail({
      to,
      subject: Mailer.parse(template.subject, data),
      html: Mailer.parse(template.html, data),
    });
  }
}

module.exports = MailerRepository;
