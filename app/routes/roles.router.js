const express = require("express");

const router = express.Router();
const {
  authMiddleware,
} = require("../infrastructure/middlewares/auth.middleware");
const routeACL = require("../infrastructure/middlewares/acl.middleware");

router.get("/", [authMiddleware, routeACL("roles.index")], (req, res, next) =>
  req.controllers.rolesController.index(req, res, next),
);

router.post("/", [authMiddleware, routeACL("roles.create")], (req, res, next) =>
  req.controllers.rolesController.create(req, res, next),
);

router.put(
  "/:role_id",
  [authMiddleware, routeACL("roles.update")],
  (req, res, next) => req.controllers.rolesController.update(req, res, next),
);

router.delete(
  "/:role_id",
  [authMiddleware, routeACL("roles.destroy")],
  (req, res, next) => req.controllers.rolesController.delete(req, res, next),
);

module.exports = {
  basePath: "/roles",
  router,
};
