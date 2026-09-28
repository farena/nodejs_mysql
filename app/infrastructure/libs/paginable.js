const { literal } = require('sequelize');
const response = require('./serviceUtil.js');

const toPositiveInt = (value, defaultValue) => {
  const number = parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : defaultValue;
};

const paginate = (query, params, literalSort = false) => {
  const page = toPositiveInt(params.page, 1);
  const perPage = toPositiveInt(params.per_page, 10);
  const sortBy = params.sort_by || params.sortBy || null;
  const sortDir = String(params.sort_dir || params.sortDir || 'ASC').toUpperCase() === 'DESC'
    ? 'DESC'
    : 'ASC';

  const offset = (page - 1) * perPage;
  const limit = perPage;

  const paginationQuery = {
    ...query,
    offset,
    limit,
    distinct: true,
  };

  if (sortBy) {
    if (literalSort) {
      paginationQuery.order = literal(`${sortBy} ${sortDir}`);
    } else if (sortBy.includes('.')) {
      const auxArr = sortBy.split('.');
      auxArr.push(sortDir);

      paginationQuery.order = [auxArr];
    } else {
      paginationQuery.order = [[sortBy, sortDir]];
    }
  }

  return paginationQuery;
};

const paginatedResult = (data, params) => {
  const total = data.count;
  const current_page = toPositiveInt(params.page, 1);
  const per_page = toPositiveInt(params.per_page, 10);
  const last_page = Math.ceil(data.count / per_page);
  const from = current_page * per_page - per_page + 1;
  const to = current_page * per_page < total ? current_page * per_page : total;

  return {
    total,
    per_page,
    current_page,
    last_page,
    from: last_page >= current_page ? from : 0,
    to: last_page >= current_page ? to : 0,
    data: data.rows,
  };
};

const paginatedResponse = (data, params) =>
  response.getResponseCustom(200, paginatedResult(data, params));

const paginable = {};

paginable.paginate = paginate;
paginable.paginatedResult = paginatedResult;
paginable.paginatedResponse = paginatedResponse;

module.exports = paginable;
