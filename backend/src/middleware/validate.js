const { validationResult } = require("express-validator");
const { AppError } = require("./errorHandler");

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return next(
      new AppError(
        `Validation failed: ${extractedErrors.map((e) => e.message).join(", ")}`,
        400
      )
    );
  };
};

module.exports = validate;
