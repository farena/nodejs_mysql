const express = require("express");

const router = express.Router();

const routeACL = require("../infrastructure/middlewares/acl.middleware");
const authMiddleware = require("../infrastructure/middlewares/auth.middleware");

router.get(
  "/users",
  [authMiddleware, routeACL("users.index")],
  (req, res, next) => req.controllers.usersController.index(req, res, next)
);
router.post(
  "/users",
  [authMiddleware, routeACL("users.create")],
  (req, res, next) => req.controllers.usersController.create(req, res, next)
);
router.get(
  "/users/:id",
  [authMiddleware, routeACL("users.show")],
  (req, res, next) => req.controllers.usersController.show(req, res, next)
);
router.put(
  "/users/:id",
  [authMiddleware, routeACL("users.update")],
  (req, res, next) => req.controllers.usersController.update(req, res, next)
);
router.put(
  "/users/:id/activate",
  [authMiddleware, routeACL("users.activate")],
  (req, res, next) =>
    req.controllers.usersController.userActivate(req, res, next)
);
router.delete(
  "/users/:id",
  [authMiddleware, routeACL("users.deactivate")],
  (req, res, next) =>
    req.controllers.usersController.userDeactivate(req, res, next)
);

router.get(
  "/users/:id/resend_activation",
  [authMiddleware, routeACL("users.resend_activation")],
  (req, res, next) =>
    req.controllers.usersController.reSendActivationEmail(req, res, next)
);
router.put(
  "/profile",
  [authMiddleware, routeACL("profile.update")],
  (req, res, next) =>
    req.controllers.usersController.updateProfile(req, res, next)
);

router.post("/users/:verification_code/verify", (req, res, next) =>
  req.controllers.usersController.verify(req, res, next)
);
router.post("/login", [], (req, res, next) =>
  req.controllers.usersController.login(req, res, next)
);
router.post("/refresh_token", [], (req, res, next) =>
  req.controllers.usersController.refreshTokenUser(req, res, next)
);
router.post("/forgot_password", [], (req, res, next) =>
  req.controllers.usersController.forgotPassword(req, res, next)
);
router.post("/reset_password/:token", [], (req, res, next) =>
  req.controllers.usersController.resetPassword(req, res, next)
);

module.exports = {
  basePath: "/",
  router,
};
