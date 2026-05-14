const { body, param } = require("express-validator");

const createSubjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Subject name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot be more than 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot be more than 500 characters"),

  body("icon").optional().trim(),

  body("parent")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent subject ID"),

  body("level")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Level must be a non-negative integer"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  body("visibility")
    .optional()
    .isIn(["public", "private"])
    .withMessage("Visibility must be public or private"),
];

const updateSubjectValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name cannot be more than 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot be more than 500 characters"),

  body("icon").optional().trim(),

  body("parent")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent subject ID"),

  body("level")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Level must be a non-negative integer"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("visibility")
    .optional()
    .isIn(["public", "private"])
    .withMessage("Visibility must be public or private"),
];

const subjectIdValidator = [
  param("id").isMongoId().withMessage("Invalid subject ID"),
];

const addResourceValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Resource title is required"),

  body("url")
    .trim()
    .notEmpty()
    .withMessage("Resource URL is required")
    .isURL()
    .withMessage("Please provide a valid URL"),

  body("type")
    .optional()
    .isIn(["youtube", "article", "pdf", "other"])
    .withMessage("Type must be youtube, article, pdf, or other"),

  body("description").optional().trim(),
];

module.exports = {
  createSubjectValidator,
  updateSubjectValidator,
  subjectIdValidator,
  addResourceValidator,
};
