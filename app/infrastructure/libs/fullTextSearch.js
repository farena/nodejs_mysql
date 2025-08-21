const replaceAll = (string, search, replace) => string.split(search).join(replace);

const fullTextWildcards = (search) => {
  let term = search;

  // removing symbols used by MySQL
  const reservedSymbols = ['-', '+', '<', '>', '@', '(', ')', '~'];
  reservedSymbols.forEach((x) => {
    if (x === '@') {
      // eslint-disable-next-line no-useless-escape
      term = replaceAll(term, x, '@');
    } else {
      term = replaceAll(term, x, ' ');
    }
  });
  const words = term.split(' ');
  let searchTerm = '';

  words.forEach((word) => {
    /*
     * applying + operator (required word) only big words
     * because smaller ones are not indexed by mysql
     */
    if (word.length >= 2) {
      if (word.includes('@')) searchTerm += `+"${word}*"`;
      else {
        searchTerm += `+${word}*`;
      }
    }
  });

  return searchTerm;
};

module.exports = (sequelize, searchColumns) => ({ value, columns = [] }) => {
  if (!value) {
    return {
      where: {},
    };
  }

  const fields = columns.length ? columns.join(',') : searchColumns.join(',');

  return {
    attributes: {
      include: [
        [
          sequelize.literal(
            `MATCH (${fields}) AGAINST('${fullTextWildcards(
              value,
            )}' IN BOOLEAN MODE)`,
          ),
          'relevance_score',
        ],
      ],
    },
    where: sequelize.literal(
      `MATCH (${fields}) AGAINST('${fullTextWildcards(
        value,
      )}' IN BOOLEAN MODE) > 0`,
    ),
  };
};
