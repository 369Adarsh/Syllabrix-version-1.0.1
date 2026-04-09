// JWT token generation and verification
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const generateToken = (userId, is_2fa_verified = false) => {
  return jwt.sign(
    { userId, is_2fa_verified },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiry, algorithm: jwtConfig.algorithm }
  );
};

const generatePreTwoFAToken = (userId) => {
  return jwt.sign(
    { userId, pre_2fa: true },
    jwtConfig.secret,
    { expiresIn: '10m' }
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

module.exports = { generateToken, verifyToken, generateResetToken, generateVerificationToken, generatePreTwoFAToken };
