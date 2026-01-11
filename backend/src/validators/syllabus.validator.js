const { body, param } = require("express-validator");

const createSyllabusValidator = [
  body("subject").isMongoId().withMessage("Valid subject ID is required"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Syllabus title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Syllabus content is required"),

  body("fileType")
    .optional()
    .isIn(["pdf", "text", "docx", "manual"])
    .withMessage("Invalid file type"),
];

const updateSyllabusValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),

  body("content").optional().trim(),
];

const syllabusIdValidator = [
  param("id").isMongoId().withMessage("Invalid syllabus ID"),
];

module.exports = {
  createSyllabusValidator,
  updateSyllabusValidator,
  syllabusIdValidator,
};
