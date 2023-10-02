const jwt = require('jsonwebtoken');

const generateAccessToken = (user) =>
  // expires after half and hour (1800 seconds = 300 minutes = 5 hours)
  jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '18000s' });

module.exports = {
  generateAccessToken,
};
