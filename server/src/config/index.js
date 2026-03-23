// Central config re-export
const env = require('./env');
const jwtConfig = require('./jwt');
const { corsOptions } = require('./cors');
const { socketOptions } = require('./socket');

module.exports = {
  ...env,
  jwt: jwtConfig,
  corsOptions,
  socketOptions,
};
