const jwt = require("jsonwebtoken");
const CustomError = require("../../domain/exceptions/CustomError");

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) throw new CustomError("No Token found", 403);

    // The token has to start with "Bearer "
    if (token.slice(0, 7) !== "Bearer ")
      throw new CustomError("Token is invalid", 401);

    // we delete bearer this part before checking
    token = token.slice(7);

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch {
      throw new CustomError("Token has expired", 401);
    }

    // Refresh tokens can only be used to get a new access token
    if (user.type === "refresh") throw new CustomError("Token is invalid", 401);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authMiddleware,
};
