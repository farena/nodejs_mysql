const express = require("express");

const router = express.Router();
const {
  authMiddleware,
} = require("../infrastructure/middlewares/auth.middleware");
const routeACL = require("../infrastructure/middlewares/acl.middleware");

router.get(
  "/",
  [authMiddleware, routeACL("functionalities.index")],
  (req, res, next) =>
    req.controllers.functionalitiesController.index(req, res, next),
);

module.exports = {
  basePath: "/functionalities",
  router,
};
