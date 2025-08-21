const response = require("../libs/serviceUtil");

class UsersController {
  constructor({
    signInUser,
    refreshToken,
    getUsersList,
    getUsersPaginableList,
    createUser,
    showUser,
    updateUser,
    resendActivationEmail,
    updateUserProfile,
    verifyUser,
    deactivateUser,
    activateUser,
    sendPasswordReset,
    resetUserPassword,
  }) {
    this.name = "usersController";
    this.signInUser = signInUser;
    this.refreshToken = refreshToken;
    this.getUsersList = getUsersList;
    this.getUsersPaginableList = getUsersPaginableList;
    this.createUser = createUser;
    this.showUser = showUser;
    this.updateUser = updateUser;
    this.resendActivationEmail = resendActivationEmail;
    this.updateUserProfile = updateUserProfile;
    this.verifyUser = verifyUser;
    this.deactivateUser = deactivateUser;
    this.activateUser = activateUser;
    this.sendPasswordReset = sendPasswordReset;
    this.resetUserPassword = resetUserPassword;
  }

  async login(req, res, next) {
    try {
      const result = await this.signInUser.execute({
        email: req.body.email,
        password: req.body.password,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async refreshTokenUser(req, res, next) {
    try {
      const result = await this.refreshToken.execute({
        refresh_token: req.body.refresh_token,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async index({ query }, res, next) {
    try {
      const { list, page, per_page, sort_by, sort_dir, ...filters } = query;
      const pagerOpts = { page, per_page, sort_by, sort_dir };

      let result;
      if (list) {
        result = await this.getUsersList.execute({
          filters,
        });
      } else {
        result = await this.getUsersPaginableList.execute({
          pagerOpts,
          filters,
        });
      }

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { first_name, last_name, email, role_id } = req.body;

      const result = await this.createUser.execute({
        first_name,
        last_name,
        email,
        role_id,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async show(req, res, next) {
    try {
      const { id: user_id } = req.params;

      const result = await this.showUser.execute({
        user_id,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id: user_id } = req.params;
      const { first_name, last_name, email, role_id } = req.body;

      const result = await this.updateUser.execute({
        user_id,
        first_name,
        last_name,
        email,
        role_id,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async reSendActivationEmail(req, res, next) {
    try {
      const { id: user_id } = req.params;

      const result = await this.resendActivationEmail.execute({
        user_id,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { user_id } = req.user;
      const {
        first_name,
        last_name,
        password,
        new_password,
        new_password_confirmation,
      } = req.body;

      const result = await this.updateUserProfile.execute({
        user_id,
        first_name,
        last_name,
        password,
        new_password,
        new_password_confirmation,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async verify(req, res, next) {
    try {
      const { verification_code } = req.params;
      const { password, password_confirmation } = req.body;

      const result = await this.verifyUser.execute({
        verification_code,
        password,
        password_confirmation,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async userDeactivate(req, res, next) {
    try {
      const { id: user_id } = req.params;

      const result = await this.deactivateUser.execute({
        user_id,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async userActivate(req, res, next) {
    try {
      const { id: user_id } = req.params;

      const result = await this.activateUser.execute({
        user_id,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await this.sendPasswordReset.execute({
        email: req.body.email,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await this.resetUserPassword.execute({
        token: req.params.token,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
