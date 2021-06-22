const { literal } = require('sequelize');
const response = require('./serviceUtil.js');

const paginate = (query, params, literalSort = false) => {
  const page = params.page || 1;
  const perPage = params.per_page || 10;
  const sortBy = params.sort_by || null;
  const sortDir = params.sort_dir || 'ASC';

  const offset = (page - 1) * perPage;
  const limit = parseInt(perPage, 10);

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

const paginatedResponse = (data, params) => {
  const total = data.count;
  const current_page = parseInt(params.page, 10) || 1;
  const per_page = parseInt(params.per_page, 10) || 10;
  const last_page = Math.ceil(data.count / (params.per_page || 10));
  const from = current_page * per_page - per_page + 1;
  const to = current_page * per_page < total ? current_page * per_page : total;

  const pResponse = {
    total,
    per_page,
    current_page,
    last_page,
    from: last_page >= current_page ? from : 0,
    to: last_page >= current_page ? to : 0,
    data: data.rows,
  };

  return response.getResponseCustom(200, pResponse);
};

const paginable = {};

paginable.paginate = paginate;
paginable.paginatedResponse = paginatedResponse;

module.exports = paginable;
