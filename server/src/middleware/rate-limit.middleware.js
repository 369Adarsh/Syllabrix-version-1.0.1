// Re-export rate limiters for route-level use
const { apiLimiter, authLimiter, uploadLimiter } = require('../config/rate-limit');
module.exports = { apiLimiter, authLimiter, uploadLimiter };
