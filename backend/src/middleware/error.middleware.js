const errorHandler = (err, req, res, next) => {
  // Check for Sequelize Unique Constraint Error (e.g. duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors && err.errors[0] ? err.errors[0].path : 'resource';
    return res.status(409).json({
      success: false,
      message: `${field === 'email' ? 'An account with this email' : field} already exists`,
      errors: {
        [field]: `${field} already exists`
      }
    });
  }

  // Check for Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const formattedErrors = {};
    err.errors.forEach((e) => {
      formattedErrors[e.path] = e.message;
    });
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: formattedErrors
    });
  }

  // Check for invalid JSON syntax in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request'
    });
  }

  // Check for custom status codes attached to errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  const response = {
    success: false,
    message
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  // Only include stack traces in non-production environments
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
