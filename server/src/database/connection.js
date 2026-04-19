// MySQL Connection Pools — Separate pools for Social and Corporate L&D
const mysql = require('mysql2/promise');
const config = require('../config/env');

const getSslConfig = (dbConfig) => dbConfig.SSL ? { rejectUnauthorized: false } : undefined;

// Wraps a pool so every query is timed and slow queries are recorded by SyllaTrace
function withQueryTrace(pool, poolName) {
  const originalQuery = pool.query.bind(pool);
  pool.query = async function tracedQuery(sql, params) {
    const start = Date.now();
    try {
      const result = await originalQuery(sql, params);
      const ms = Date.now() - start;
      if (ms >= 150) {
        try { require('../middleware/trace.middleware').recordSlowQuery(sql, ms, poolName); } catch (_) {}
      }
      return result;
    } catch (err) {
      const ms = Date.now() - start;
      try { require('../middleware/trace.middleware').recordSlowQuery(`[ERROR] ${sql}`, ms, poolName); } catch (_) {}
      throw err;
    }
  };
  return pool;
}

// Syllabrix Social Pool
const socialPool = mysql.createPool({
  host: config.DB_SOCIAL.HOST,
  port: config.DB_SOCIAL.PORT,
  database: config.DB_SOCIAL.NAME,
  user: config.DB_SOCIAL.USER,
  password: config.DB_SOCIAL.PASSWORD,
  connectionLimit: config.DB_SOCIAL.CONNECTION_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  ssl: getSslConfig(config.DB_SOCIAL),
  charset: 'utf8mb4',
  timezone: '+00:00',
});

// Syllabrix Corporate L&D Pool
const ldPool = mysql.createPool({
  host: config.DB_LD.HOST,
  port: config.DB_LD.PORT,
  database: config.DB_LD.NAME,
  user: config.DB_LD.USER,
  password: config.DB_LD.PASSWORD,
  connectionLimit: config.DB_LD.CONNECTION_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  ssl: getSslConfig(config.DB_LD),
  charset: 'utf8mb4',
  timezone: '+00:00',
});

// Apply query tracing to both pools
withQueryTrace(socialPool, 'social');
withQueryTrace(ldPool, 'corporate');

const testConnection = async () => {
  let socialOk = false;
  let ldOk = false;

  try {
    const conn = await socialPool.getConnection();
    console.log(`  [SOCIAL]   Database connected: ${config.DB_SOCIAL.NAME} @ ${config.DB_SOCIAL.HOST}`);
    conn.release();
    socialOk = true;
  } catch (error) {
    console.error('  [SOCIAL]   Database connection FAILED:', error.message);
  }

  try {
    const conn = await ldPool.getConnection();
    console.log(`  [CORPORATE] Database connected: ${config.DB_LD.NAME} @ ${config.DB_LD.HOST}`);
    conn.release();
    ldOk = true;
  } catch (error) {
    console.error('  [CORPORATE] Database connection FAILED:', error.message);
  }

  return socialOk && ldOk;
};

module.exports = { 
  pool: socialPool, // Backward compatibility alias
  socialPool, 
  ldPool, 
  testConnection 
};