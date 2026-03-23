// MySQL Connection Pool — Single connection for the entire app
const mysql = require('mysql2/promise');
const config = require('../config/env');

const sslConfig = config.DB.SSL ? { rejectUnauthorized: false } : undefined;

const pool = mysql.createPool({
  host: config.DB.HOST,
  port: config.DB.PORT,
  database: config.DB.NAME,
  user: config.DB.USER,
  password: config.DB.PASSWORD,
  connectionLimit: config.DB.CONNECTION_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  ssl: sslConfig,
  charset: 'utf8mb4',
  timezone: '+00:00',
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`  Database connected: ${config.DB.NAME} @ ${config.DB.HOST}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('  Database connection FAILED:', error.message);
    return false;
  }
};

module.exports = { pool, testConnection };