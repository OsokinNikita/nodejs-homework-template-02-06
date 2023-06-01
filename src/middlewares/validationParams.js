const { httpError } = require("../helpers");

const validationParams = (schema) => {
  const func = (req, res, next) => {
    const { error } = schema.validateAsync(req.params);
    if (error) {
      next(httpError(404, error.message));
    }
    next();
  };
  return func;
};

module.exports = validationParams;
