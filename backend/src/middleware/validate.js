// backend/src/middleware/validate.js
const { AppError } = require('./errorHandler');

/**
 * Validates req.body using a Zod schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      const message = issue ? `${issue.path.join('.')}: ${issue.message}` : 'Validation error';
      return next(new AppError(message, 400));
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validates req.query using a Zod schema
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issue = result.error.issues[0];
      const message = issue ? `${issue.path.join('.')}: ${issue.message}` : 'Query validation error';
      return next(new AppError(message, 400));
    }
    req.query = result.data;
    next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
};
