const { body, param } = require("express-validator");

const questionValidator = [
  body("questions")
    .isArray({ min: 1 })
    .withMessage("At least one question is required"),

  body("questions.*.question")
    .trim()
    .notEmpty()
    .withMessage("Question text is required"),

  body("questions.*.options")
    .isArray({ min: 2, max: 6 })
    .withMessage("Each question must have 2-6 options"),

  body("questions.*.correctAnswer")
    .isInt({ min: 0 })
    .withMessage("Correct answer index is required"),

  body("questions.*.explanation").optional().trim(),

  body("questions.*.points")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Points must be at least 1"),
];

const createQuizValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Quiz title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot be more than 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot be more than 1000 characters"),

  body("subject").isMongoId().withMessage("Valid subject ID is required"),

  ...questionValidator,

  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),

  body("timeLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Time limit must be at least 1 minute"),

  body("passingScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Passing score must be between 0 and 100"),

  body("showAnswers")
    .optional()
    .isBoolean()
    .withMessage("showAnswers must be a boolean"),
];

const updateQuizValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Title cannot be more than 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot be more than 1000 characters"),

  body("subject").optional().isMongoId().withMessage("Invalid subject ID"),

  body("questions")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one question is required"),

  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),

  body("timeLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Time limit must be at least 1 minute"),

  body("passingScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Passing score must be between 0 and 100"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),

  body("showAnswers")
    .optional()
    .isBoolean()
    .withMessage("showAnswers must be a boolean"),
];

const quizIdValidator = [
  param("id").isMongoId().withMessage("Invalid quiz ID"),
];

module.exports = {
  createQuizValidator,
  updateQuizValidator,
  quizIdValidator,
};
