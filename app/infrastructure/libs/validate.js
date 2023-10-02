const moment = require('moment');
const Validator = require('validatorjs');
const CustomError = require('../../domain/exceptions/CustomError');

const isValidDate = (date) => typeof date === 'string' || moment(date).isValid();

module.exports = async (data, rules, messages) => {
  const validation = new Validator(data, rules, messages);

  Validator.register('after_or_equal', (date, params) => {
    const val1 = date;
    const val2 = params.split(',')[0];

    if (!isValidDate(val1) || !isValidDate(val2)) return false;

    const inputDate = moment(val1);
    const afterDate = moment(val2);

    return inputDate.isSameOrAfter(afterDate);
  }, 'The :attribute must be equal or after :after_or_equal.');

  Validator.register('before_or_equal', (date, params) => {
    const val1 = date;
    const val2 = params.split(',')[0];

    if (!isValidDate(val1) || !isValidDate(val2)) return false;

    const inputDate = moment(val1);
    const beforeDate = moment(val2);

    return inputDate.isSameOrBefore(beforeDate);
  }, 'The :attribute must be equal or before :before_or_equal.');

  Validator.register('after', (date, params) => {
    const val1 = date;
    const val2 = params.split(',')[0];

    if (!isValidDate(val1) || !isValidDate(val2)) return false;

    const inputDate = moment(val1);
    const afterDate = moment(val2);

    return inputDate.isAfter(afterDate);
  }, 'The :attribute must be after :after.');

  Validator.register('before', (date, params) => {
    const val1 = date;
    const val2 = params.split(',')[0];

    if (!isValidDate(val1) || !isValidDate(val2)) return false;

    const inputDate = moment(val1);
    const beforeDate = moment(val2);

    return inputDate.isBefore(beforeDate);
  }, 'The :attribute must be before :before.');

  if (validation.fails()) {
    throw new CustomError(validation.errors.all(), 412);
  }
};
