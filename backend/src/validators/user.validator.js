const { body, param } = require("express-validator");

const updateUserValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Name cannot be more than 50 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("role")
    .optional()
    .isIn(["student", "teacher", "admin"])
    .withMessage("Role must be student, teacher, or admin"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const userIdValidator = [
  param("id").isMongoId().withMessage("Invalid user ID"),
];

const enrollSubjectValidator = [
  body("subjectId").isMongoId().withMessage("Invalid subject ID"),
];

module.exports = {
  updateUserValidator,
  userIdValidator,
  enrollSubjectValidator,
};
