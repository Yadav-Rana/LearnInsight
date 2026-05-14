const express = require("express");
const router = express.Router();

// Import route files
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const subjectRoutes = require("./subject.routes");
const quizRoutes = require("./quiz.routes");
const quizAttemptRoutes = require("./quizAttempt.routes");
const progressRoutes = require("./progress.routes");
const insightRoutes = require("./insight.routes");
const syllabusRoutes = require("./syllabus.routes");
const youtubeRoutes = require("./youtube.routes");

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/subjects", subjectRoutes);
router.use("/quizzes", quizRoutes);
router.use("/attempts", quizAttemptRoutes);
router.use("/progress", progressRoutes);
router.use("/insights", insightRoutes);
router.use("/syllabus", syllabusRoutes);
router.use("/youtube", youtubeRoutes);

module.exports = router;
