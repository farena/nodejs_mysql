const response = require('../libs/serviceUtil');

class UsersController {
  constructor({ loginUser, updateUserProfile }) {
    this.name = 'UsersController';
    this.loginUser = loginUser;
    this.updateUserProfile = updateUserProfile;
  }

  async login(req, res, next) {
    try {
      const result = await this.loginUser.execute({
        email: req.body.email,
        password: req.body.password,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const result = await this.updateUserProfile.execute({
        email: req.body.email,
        password: req.body.password,
        new_password: req.body.new_password,
        new_password_confirmation: req.body.new_password_confirmation,
        user: req.user,
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
