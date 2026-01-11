const express = require("express");
const router = express.Router();

const {
  submitAttempt,
  getMyAttempts,
  getAttempt,
  getAttemptsByQuiz,
  getBestAttempt,
  getMyStats,
} = require("../controllers/quizAttempt.controller");

const { protect, authorize } = require("../middleware");
const validate = require("../middleware/validate");

const {
  submitAttemptValidator,
  attemptIdValidator,
  quizIdParamValidator,
} = require("../validators/quizAttempt.validator");

// All routes require authentication
router.use(protect);

// Submit attempt and get my attempts
router
  .route("/")
  .post(validate(submitAttemptValidator), submitAttempt)
  .get(getMyAttempts);

// Get my stats
router.get("/stats", getMyStats);

// Get attempts by quiz (teacher/admin only)
router.get(
  "/quiz/:quizId",
  authorize("admin", "teacher"),
  validate(quizIdParamValidator),
  getAttemptsByQuiz
);

// Get best attempt for a quiz
router.get(
  "/quiz/:quizId/best",
  validate(quizIdParamValidator),
  getBestAttempt
);

// Get single attempt
router.get("/:id", validate(attemptIdValidator), getAttempt);

module.exports = router;
