const nodemailer = require('nodemailer');
const config = require('../config/config');

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
};
