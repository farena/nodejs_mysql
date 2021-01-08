const jwt = require('jsonwebtoken');

// nota: verificar token, hay que formatear las respuetas.
// eslint-disable-next-line consistent-return
const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) throw new CustomError('Token was not found', 403);

    // The token has to start with "Bearer "
    if (token.slice(0, 7) !== 'Bearer ') throw new CustomError('Token is invalid', 401);

    // we delete bearer this part before checking
    token = token.slice(7);

    // eslint-disable-next-line consistent-return
    await jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
      if (err) throw new CustomError('Token has expired', 401);

      req.user = user;
      next();
    });
  } catch (err) {
    next(err);
  }
};

const generateAccessToken = (user) =>
  // expires after half and hour (1800 seconds = 300 minutes = 5 hours)
  jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '18000s' });

module.exports = {
  authMiddleware,
  generateAccessToken,
};
