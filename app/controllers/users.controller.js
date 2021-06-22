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
        if (!req.body.password) throw new CustomError('Please send a Password', 412);

        const user = await models.user.findOne({
          where: {
            email: req.body.email,
          },
          transaction,
        });

        if (!user) throw new CustomError('Incorrect User or Password', 401);
        if (!user.checkPassword(req.body.password)) throw new CustomError('Incorrect User or Password', 401);

        const userRes = { ...user };
        delete userRes.password;

        return {
          userRes,
          token: auth.generateAccessToken({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          }),
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
        if (!req.body.first_name) throw new CustomError('First Name Attribute is required', 412);
        if (!req.body.last_name) throw new CustomError('Last Name Attribute is required', 412);

        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
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
