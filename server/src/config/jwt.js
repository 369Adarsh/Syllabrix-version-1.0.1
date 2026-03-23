const config = require('./env');

module.exports = {
  secret: config.JWT.SECRET,
  expiry: config.JWT.EXPIRY,
  algorithm: 'HS256',
};
