const config = require('./src/config/env');
const { testConnection } = require('./src/database/connection');

console.log('--- START DIAGNOSTIC ---');
console.log('CONFIG DB_LD_NAME:', config.DB_LD.NAME);
console.log('CONFIG SERVER_PORT:', config.SERVER_PORT);

testConnection().then(ok => {
  console.log('Connection OK:', ok);
  process.exit(ok ? 0 : 1);
}).catch(err => {
  console.error('CRITICAL ERROR during testConnection:', err);
  process.exit(1);
});
