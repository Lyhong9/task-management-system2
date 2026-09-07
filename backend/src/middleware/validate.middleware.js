const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const validatedData = schema.parse(dataToValidate);
      req[source] = validatedData;
      next();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const formattedErrors = {};
        err.errors.forEach((issue) => {
          const field = issue.path.length > 0 ? issue.path.join('.') : 'general';
          if (!formattedErrors[field]) {
            formattedErrors[field] = issue.message;
          }
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }

      next(err);
    }
  };
};

module.exports = { validateRequest };
