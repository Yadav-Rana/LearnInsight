const express = require("express");
const router = express.Router();

const {
  getMyProgress,
  getProgressBySubject,
  updateProgress,
  markResourceViewed,
  getStudentProgress,
  getSubjectStudentsProgress,
  getLeaderboard,
} = require("../controllers/progress.controller");

const { protect, authorize } = require("../middleware");
const validate = require("../middleware/validate");

const {
  updateProgressValidator,
  subjectIdValidator,
  userIdValidator,
  markResourceViewedValidator,
} = require("../validators/progress.validator");

// All routes require authentication
router.use(protect);

// Get my progress (all subjects)
router.get("/", getMyProgress);

// Get/Update progress for a specific subject
router
  .route("/subject/:subjectId")
  .get(validate(subjectIdValidator), getProgressBySubject)
  .put(
    validate([...subjectIdValidator, ...updateProgressValidator]),
    updateProgress
  );

// Mark resource as viewed
router.post(
  "/subject/:subjectId/resource",
  validate([...subjectIdValidator, ...markResourceViewedValidator]),
  markResourceViewed
);

// Get leaderboard for a subject
router.get(
  "/subject/:subjectId/leaderboard",
  validate(subjectIdValidator),
  getLeaderboard
);

// Get all students progress for a subject (teacher/admin)
router.get(
  "/subject/:subjectId/students",
  authorize("admin", "teacher"),
  validate(subjectIdValidator),
  getSubjectStudentsProgress
);

// Get specific student's progress (teacher/admin)
router.get(
  "/user/:userId",
  authorize("admin", "teacher"),
  validate(userIdValidator),
  getStudentProgress
);

module.exports = router;
