const models = require('../models');
const response = require('../functions/serviceUtil.js');
const auth = require('../middlewares/auth.js');
const CustomError = require('../functions/CustomError');
const validate = require('../functions/validate');

module.exports = {
  name: 'usersController',

  login: async (req, res, next) => {
    try {
      // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        await validate(req.body, {
          email: 'required|email',
          password: 'required',
        }, {
          'required.email': 'Envía un email por favor',
          'email.email': 'El email es inválido',
          'required.password': 'Envía una contraseña por favor',
        });

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
        await validate(req.body, {
          email: 'required|email',
          password: 'required',
          new_password: 'required|confirmed|min:6',
        }, {
          'required.email': 'Envía un email por favor',
          'email.email': 'El email es inválido',
          'required.password': 'Envía tu contraseña actual por favor',
          'confirmed.new_password': 'Las nuevas contraseñas no son iguales',
          'min.new_password': 'La nueva contraseña debe tener al menos 6 caracteres',
        });

        const user = await models.user.findByPk(req.user.id, { transaction });
        if (!user.checkPassword(req.body.password)) throw new CustomError('The password is incorrect', 412);

        if (req.body.new_password) user.password = req.body.new_password;
        await user.save({ transaction });

        return 'Perfil actualizado con exito';
      });

      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      next(error);
    }
  },
};
