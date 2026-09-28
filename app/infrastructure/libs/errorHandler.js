const fs = require("fs");
const CustomError = require("../../domain/exceptions/CustomError");

module.exports = {
  errorHandler: (err, req, res, next) => {
    if (err.message && typeof err.message === "object") {
      return res.status(err.status || err.code || 500).json({
        code: err.status || err.code || 500,
        message: null,
        success: false,
        errors: err.message,
      });
    }

    // treat as 404 only when the error is actually a 404 (e.g. resource not found).
    // Do not use message content: "No Token found" contains "not found" and would wrongly become 404.
    if (err.code === 404 || err.status === 404) {
      return next();
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(412).json({
        code: 412,
        message: `The ${err.errors[0].path} "${err.errors[0].value}" is already in use`,
        success: false,
        data: [],
      });
    }

    console.error(err.stack);

    // error as json
    return res.status(err.status || err.code || 500).json({
      code: err.status || err.code || 500,
      message: err.message,
      success: false,
      data: [],
    });
  },
  downloadErrorHandler: (err, res, path) => {
    const IS_TEST = process.env.NODE_ENV === "test";
    const IS_DEV = process.env.NODE_ENV === "development";

    if (err) {
      throw new CustomError(err, 500);
    }

    if (!IS_TEST) {
      // here remove temp file
      fs.unlink(path, (error) => {
        if (error && IS_DEV) {
          console.error(error);
        }
      });
    }

    res.end();
  },
};
