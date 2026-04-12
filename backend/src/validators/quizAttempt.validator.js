const { body, param } = require("express-validator");

const submitAttemptValidator = [
  body("quizId").isMongoId().withMessage("Valid quiz ID is required"),

  body("answers")
    .isArray({ min: 1 })
    .withMessage("Answers are required"),

  body("answers.*.questionId")
    .isMongoId()
    .withMessage("Valid question ID is required"),

  body("answers.*.selectedAnswer")
    .isInt({ min: -1 })
    .withMessage("Selected answer index is required"),

  body("startedAt")
    .isISO8601()
    .withMessage("Valid start time is required"),
];

const attemptIdValidator = [
  param("id").isMongoId().withMessage("Invalid attempt ID"),
];

const quizIdParamValidator = [
  param("quizId").isMongoId().withMessage("Invalid quiz ID"),
];

module.exports = {
  submitAttemptValidator,
  attemptIdValidator,
  quizIdParamValidator,
};
