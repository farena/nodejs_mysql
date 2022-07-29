const hs = require('handlebars');
const nodemailer = require('nodemailer');
const config = require('../config/config');

/**
 * USAGE EXAMPLE:
  const { loadFile } = require('../functions/fileSystem');
  const { mail, mailParse } = require('../functions/mailer');
  const config = require('../config/config');

  const email_template = loadFile('path/to/file');
  const template_data = {...};

  const mailInfo = await mail.sendMail({
    from: config.mail_from,
    bcc: 'bcc@recipient.com',
    to: 'to@recipient.com',
    subject: 'My Subject',
    html: mailParse(email_template, template_data),
  });

  console.log({ mailInfo });
 */

module.exports = {
  mail: nodemailer.createTransport({
    host: config.mail_host,
    port: config.mail_port || 2525,
    auth: {
      user: config.mail_user,
      pass: config.mail_pwd,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
    rateDelta: 20000,
    rateLimit: 5,
    pool: true, // use pooled connection
    maxConnections: 1, // set limit to 1 connection only
    maxMessages: 2, // send 3 emails per second
  }),
  mailParse: (template, data) => hs.compile(template)(data),
};
