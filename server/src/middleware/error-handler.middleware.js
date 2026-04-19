// Global error handler — catches all errors
// Must have 4 parameters for Express to recognize it as error middleware

const config = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  console.error('ERROR:', err.message);

  if (config.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }

  // Attach error context so traceMiddleware can include it in the error buffer
  res.locals.traceError = err.message;
  if (err.stack) res.locals.traceErrorStack = err.stack.split('\n').slice(0, 6).join('\n');

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the maximum allowed limit.',
    });
  }

  // Multer file count error
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Too many files uploaded.',
    });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'This record already exists.',
    });
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
    });
  }

  // Custom API errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.data ? { data: err.data } : {}),
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong. Please try again later.',
  });
};

module.exports = { errorHandler };
