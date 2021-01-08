const express = require('express');

const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth.js');

router.post('/login', [], controllers.usersController.login);
router.put('/profile', [ authMiddleware ], controllers.usersController.updateProfile);

module.exports = {
  basePath: '/',
  router,
};
