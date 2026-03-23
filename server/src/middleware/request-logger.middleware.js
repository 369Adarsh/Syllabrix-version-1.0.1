// Custom request logger — logs method, URL, status, and duration
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Only log API requests, skip health checks in production
    if (req.originalUrl === '/api/health' && process.env.NODE_ENV !== 'development') {
      return;
    }

    const color = status >= 500 ? '\x1b[31m'  // Red
      : status >= 400 ? '\x1b[33m'            // Yellow
      : status >= 300 ? '\x1b[36m'            // Cyan
      : '\x1b[32m';                           // Green

    console.log(
      `${color}${req.method}\x1b[0m ${req.originalUrl} ${color}${status}\x1b[0m ${duration}ms`
    );
  });

  next();
};

module.exports = { requestLogger };
