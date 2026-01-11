const express = require("express");
const router = express.Router();

const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublish,
  getQuizzesBySubject,
  duplicateQuiz,
} = require("../controllers/quiz.controller");

const { protect, authorize } = require("../middleware");
const validate = require("../middleware/validate");

const {
  createQuizValidator,
  updateQuizValidator,
  quizIdValidator,
} = require("../validators/quiz.validator");

// All routes require authentication
router.use(protect);

router
  .route("/")
  .get(getQuizzes)
  .post(
    authorize("admin", "teacher"),
    validate(createQuizValidator),
    createQuiz
  );

// Get quizzes by subject
router.get("/subject/:subjectId", getQuizzesBySubject);

router
  .route("/:id")
  .get(validate(quizIdValidator), getQuiz)
  .put(
    authorize("admin", "teacher"),
    validate([...quizIdValidator, ...updateQuizValidator]),
    updateQuiz
  )
  .delete(
    authorize("admin", "teacher"),
    validate(quizIdValidator),
    deleteQuiz
  );

// Publish/Unpublish quiz
router.put(
  "/:id/publish",
  authorize("admin", "teacher"),
  validate(quizIdValidator),
  togglePublish
);

// Duplicate quiz
router.post(
  "/:id/duplicate",
  authorize("admin", "teacher"),
  validate(quizIdValidator),
  duplicateQuiz
);

module.exports = router;
