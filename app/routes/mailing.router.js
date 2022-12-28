const express = require('express');

const router = express.Router();
const controllers = require('../controllers/index');

router.post('/', [], controllers.mailingController.send);

module.exports = {
  basePath: '/mailing',
  router,
};
