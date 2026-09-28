const jwt = require('jsonwebtoken');
const CustomError = require('../../domain/exceptions/CustomError');

module.exports = class JWT {
  constructor(secret) {
    this.secret = secret;
  }

  // expires after 5 hours (18000 seconds)
  generateAccessToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: '18000s' });
  }

  // expires after 30 days
  generateRefreshToken(payload) {
    return jwt.sign({ ...payload, type: 'refresh' }, this.secret, {
      expiresIn: '30d',
    });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      throw new CustomError('Token has expired', 401);
    }
  }

  verifyRefreshToken(token) {
    if (!token) throw new CustomError('Refresh token is required', 412);

    let payload;
    try {
      payload = jwt.verify(token, this.secret);
    } catch {
      throw new CustomError('Refresh token is invalid or has expired', 401);
    }

    if (payload.type !== 'refresh') {
      throw new CustomError('Refresh token is invalid or has expired', 401);
    }

    return payload;
  }
};
