const hs = require("handlebars");
const nodemailer = require("nodemailer");
const config = require("../../config/config");

const isConfigured = (value) => !!value && value !== "null";

/**
 * USAGE EXAMPLE:
  const Mailer = require('../libs/mailer');

  const mailer = new Mailer({ host, port, user, password, from });

  const mailInfo = await mailer.sendMail({
    to: 'to@recipient.com',
    subject: 'My Subject',
    html: Mailer.parse('<p>Hi {{name}}</p>', { name: 'John' }),
  });
 */
module.exports = class Mailer {
  constructor({ host, port, user, password, from = config.mail_from } = {}) {
    this.from = from;
    this.enabled = isConfigured(host);

    if (!this.enabled) return;

    this.transport = nodemailer.createTransport({
      host,
      port: isConfigured(port) ? port : 2525,
      auth: {
        user,
        pass: password,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
      rateDelta: 20000,
      rateLimit: 5,
      pool: true, // use pooled connection
      maxConnections: 1, // set limit to 1 connection only
      maxMessages: 2,
    });
  }

  async sendMail({ to, subject, html, ...rest }) {
    // Without SMTP settings (e.g. local development) emails are only logged
    if (!this.enabled) {
      console.log(`[Mailer] SMTP not configured. Email to ${to} not sent:`, {
        subject,
        html,
      });
      return null;
    }

    return this.transport.sendMail({
      from: this.from,
      to,
      subject,
      html,
      ...rest,
    });
  }

  static parse(template, data) {
    return hs.compile(template)(data);
  }
};
