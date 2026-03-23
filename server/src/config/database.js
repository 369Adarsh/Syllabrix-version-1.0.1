// Re-export database connection for convenience
const { pool, testConnection } = require('../database/connection');
module.exports = { pool, testConnection };
