// Custom API Error class
// Throw these in services, caught by error-handler middleware

class ApiError extends Error {
  constructor(message, statusCode = 500, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    if (data) this.data = data;
  }

  static badRequest(message = 'Bad request', data = null) {
    return new ApiError(message, 400, data);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Not found') {
    return new ApiError(message, 404);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(message, 409);
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(message, 429);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(message, 500);
  }
}

module.exports = { ApiError };
