const mysql = require('mysql2/promise');
const config = require('./src/config/env');

const listDbs = async () => {
  const conn = await mysql.createConnection({
    host: config.DB_SOCIAL.HOST,
    port: config.DB_SOCIAL.PORT,
    user: config.DB_SOCIAL.USER,
    password: config.DB_SOCIAL.PASSWORD,
    ssl: { rejectUnauthorized: false }
  });
  const [rows] = await conn.query('SHOW DATABASES');
  console.log('DATABASES:', rows.map(r => r.Database));
  await conn.end();
};

listDbs().catch(console.error);
