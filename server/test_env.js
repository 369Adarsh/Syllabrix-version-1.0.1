const config = require('./src/config/env');
console.log('--- DB CONFIG ---');
console.log('SOCIAL NAME:', config.DB_SOCIAL.NAME);
console.log('LD NAME:', config.DB_LD.NAME);
console.log('SERVER PORT:', config.SERVER_PORT);
console.log('--- ALL ---');
console.log(JSON.stringify(config, null, 2));
