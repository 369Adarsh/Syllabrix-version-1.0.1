const mysql = require('mysql2/promise');
const config = require('./src/config/env');

const checkTables = async () => {
  const conn = await mysql.createConnection({
    host: config.DB_SOCIAL.HOST,
    port: config.DB_SOCIAL.PORT,
    user: config.DB_SOCIAL.USER,
    password: config.DB_SOCIAL.PASSWORD,
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });
  const [rows] = await conn.query('SHOW TABLES');
  console.log('TABLES in defaultdb:', rows.map(r => Object.values(r)[0]));
  await conn.end();
};

checkTables().catch(console.error);
