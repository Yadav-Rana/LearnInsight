const express = require("express");
const router = express.Router();

const {
  generateInsights,
  getLatestInsight,
  getMyInsights,
  getInsight,
  getStudentInsights,
} = require("../controllers/insight.controller");

const { protect, authorize } = require("../middleware");
const validate = require("../middleware/validate");

const {
  insightIdValidator,
  userIdValidator,
} = require("../validators/insight.validator");

// All routes require authentication
router.use(protect);

// Generate new insights
router.post("/generate", generateInsights);

// Get latest insight
router.get("/latest", getLatestInsight);

// Get all my insights
router.get("/", getMyInsights);

// Get student's insights (teacher/admin)
router.get(
  "/user/:userId",
  authorize("admin", "teacher"),
  validate(userIdValidator),
  getStudentInsights
);

// Get single insight
router.get("/:id", validate(insightIdValidator), getInsight);

module.exports = router;
