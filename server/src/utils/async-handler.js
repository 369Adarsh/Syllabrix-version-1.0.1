// Async error wrapper for Express route handlers
// Catches async errors and passes them to error-handler middleware
// Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { asyncHandler };
