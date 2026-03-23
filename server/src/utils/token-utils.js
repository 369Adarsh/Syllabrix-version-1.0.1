// JWT token generation and verification
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiry, algorithm: jwtConfig.algorithm }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    return null;
  }
};

const generateResetToken = (userId) => {
  return jwt.sign(
    { userId, type: 'reset' },
    jwtConfig.secret,
    { expiresIn: '1h' }
  );
};

const generateVerificationToken = (userId) => {
  return jwt.sign(
    { userId, type: 'verify' },
    jwtConfig.secret,
    { expiresIn: '24h' }
  );
};

module.exports = { generateToken, verifyToken, generateResetToken, generateVerificationToken };
