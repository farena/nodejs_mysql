const models = require('../models');
const response = require('../functions/serviceUtil.js');
const auth = require('../middlewares/auth.js');
const CustomError = require('../functions/CustomError');

module.exports = {
  name: 'usersController',

  login: async (req, res, next) => {
    try {
      // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        if (!req.body.password) throw new CustomError('Envía una contraseña por favor', 412);

        const user = await models.user.findOne({
          where: {
            email: req.body.email,
          },
          transaction,
        });

        if (!user) throw new CustomError('Usuario o contraseña incorrectos', 401);
        if (!user.checkPassword(req.body.password)) throw new CustomError('Usuario o contraseña incorrectos', 401);

        const userRes = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        };

        return {
          user: userRes,
          token: auth.generateAccessToken(userRes),
        };
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      // Transaction Failed!
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const user = await models.user.findByPk(req.user.id, { transaction });

        // VALIDATIONS
        if (!req.body.password) throw new CustomError('You have to send your Actual Password', 412);
        if (!user.checkPassword(req.body.password)) throw new CustomError('The password is incorrect', 412);
        if (req.body.new_password !== req.body.new_password_confirmation) {
          throw new CustomError('The New Passwords are not the same', 412);
        }
        if (req.body.new_password && req.body.new_password.length < 6) {
          throw new CustomError('New Password must have at least 6 characters');
        }
        if (req.body.new_password) user.password = req.body.new_password;
        await user.save({ transaction });

        return 'Profile updated succesfully';
      });

      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  },
};
