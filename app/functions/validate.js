const Validator = require('validatorjs');
const CustomError = require('./CustomError');

module.exports = async (data, rules, messages) => {
  const validation = new Validator(data, rules, messages);

  if (validation.fails()) {
    throw new CustomError(validation.errors.all(), 412);
  }
};
