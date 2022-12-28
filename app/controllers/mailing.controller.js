const response = require('../functions/serviceUtil.js');
const config = require('../config/config');
const { loadFile } = require('../functions/fileSystem');
const { mail, mailParse } = require('../functions/mailer');

module.exports = {
  name: 'mailingController',

  send: async (req, res, next) => {
    try {
      // Start Transaction
      const email_template = loadFile('path/to/file');
      const template_data = {
        logo_url: 'http://via.placeholder.com/150x75',
        name: 'Testing name',
      };

      const mailInfo = await mail.sendMail({
        from: config.mail_from,
        // bcc: 'bcc@recipient.com',
        to: 'to@recipient.com',
        subject: 'My Subject',
        html: mailParse(email_template, template_data),
      });

      console.log({ mailInfo });

      res.status(200).send(response.getResponseCustom(200, 'Email sent succesfully'));
      res.end();
    } catch (error) {
      // Transaction Failed!
      next(error);
    }
  },
};
