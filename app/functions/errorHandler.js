module.exports = {
  errorHandler: (err, req, res, next) => {
    // treat as 404
    if (
      err.message &&
      // eslint-disable-next-line no-bitwise
      (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))
    ) {
      return next();
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(err.status || err.code || 500)
        .json({
          code: 412,
          message: `The ${err.errors[0].path} "${err.errors[0].value}" is already in use`,
          success: false,
          data: [],
        });
    }

    console.error(err.stack);

    // error as json
    return res.status(err.status || err.code || 500)
      .json({
        code: err.status || err.code || 500,
        message: err.message,
        success: false,
        data: [],
      });
  }
}