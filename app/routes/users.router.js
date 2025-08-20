const express = require("express");

const router = express.Router();
const {
  authMiddleware,
} = require("../infrastructure/middlewares/auth.middleware");

router.post("/login", [], (req, res, next) =>
  req.controllers.usersController.login(req, res, next)
);

router.put("/profile", [authMiddleware], (req, res, next) =>
  req.controllers.usersController.updateProfile(req, res, next)
);

module.exports = {
  basePath: "/",
  router,
};
