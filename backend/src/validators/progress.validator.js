const { body, param } = require("express-validator");

const updateProgressValidator = [
  body("completionRate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Completion rate must be between 0 and 100"),

  body("timeSpent")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Time spent must be a positive number"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Notes cannot exceed 5000 characters"),
];

const subjectIdValidator = [
  param("subjectId").isMongoId().withMessage("Invalid subject ID"),
];

const userIdValidator = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
];

const markResourceViewedValidator = [
  body("resourceId").isMongoId().withMessage("Invalid resource ID"),
];

module.exports = {
  updateProgressValidator,
  subjectIdValidator,
  userIdValidator,
  markResourceViewedValidator,
};
