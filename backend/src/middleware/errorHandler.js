// backend/src/middleware/errorHandler.js

/**
 * Custom application error with HTTP status code
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Central error-handling middleware
 * Ensures all error responses strictly follow { error: { message } }
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.url} -`, err);
  }

  res.status(statusCode).json({
    error: {
      message,
    },
  });
}

module.exports = {
  AppError,
  errorHandler,
};
