const asyncHandler = require("express-async-handler");
const { Insight, Progress, Subject, QuizAttempt } = require("../models");
const { AppError } = require("../middleware");
const geminiService = require("../services/gemini.service");
const youtubeService = require("../services/youtube.service");

/**
 * @desc    Generate insights for current user
 * @route   POST /api/v1/insights/generate
 * @access  Private
 */
const generateInsights = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Get all progress data
  const progressData = await Progress.find({ user: userId })
    .populate("subject", "name level")
    .populate({
      path: "quizAttempts",
      select: "percentage passed completedAt",
      options: { sort: { completedAt: -1 }, limit: 20 },
    });

  if (progressData.length === 0) {
    return next(
      new AppError("No progress data found. Start learning to get insights!", 404)
    );
  }

  // Analyze weak areas
  const weakAreas = [];
  const strengths = [];

  for (const progress of progressData) {
    if (progress.quizStats.totalAttempts >= 2) {
      if (progress.quizStats.averageScore < 60) {
        weakAreas.push({
          subject: progress.subject._id,
          reason: getWeaknessReason(progress),
          severity: getSeverity(progress.quizStats.averageScore),
          averageScore: progress.quizStats.averageScore,
          suggestedAction: getSuggestedAction(progress),
        });
      } else if (progress.quizStats.averageScore >= 80) {
        strengths.push({
          subject: progress.subject._id,
          reason: `Consistently scoring ${progress.quizStats.averageScore}% average`,
          averageScore: progress.quizStats.averageScore,
        });
      }
    }
  }

  // Sort by severity/score
  weakAreas.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Calculate overall stats
  const overallStats = {
    totalSubjects: progressData.length,
    averageCompletionRate: Math.round(
      progressData.reduce((sum, p) => sum + p.completionRate, 0) /
        progressData.length
    ),
    averageQuizScore: 0,
    totalTimeSpent: progressData.reduce((sum, p) => sum + p.totalTimeSpent, 0),
  };

  const withQuizzes = progressData.filter((p) => p.quizStats.totalAttempts > 0);
  if (withQuizzes.length > 0) {
    overallStats.averageQuizScore = Math.round(
      withQuizzes.reduce((sum, p) => sum + p.quizStats.averageScore, 0) /
        withQuizzes.length
    );
  }

  // Build name-resolved snapshots so the AI prompt can read subject names
  const subjectNames = Object.fromEntries(
    progressData.map((p) => [p.subject._id.toString(), p.subject.name])
  );
  const weakAreasForAI = weakAreas.map((w) => ({
    ...w,
    subjectName: subjectNames[w.subject.toString()],
  }));
  const strengthsForAI = strengths.map((s) => ({
    ...s,
    subjectName: subjectNames[s.subject.toString()],
  }));

  const [aiSummary, recommendations] = await Promise.all([
    geminiService.generateInsightSummary({
      overallStats,
      weakAreas: weakAreasForAI,
      strengths: strengthsForAI,
    }),
    buildRecommendations(weakAreas, weakAreasForAI),
  ]);

  // Create insight
  const insight = await Insight.create({
    user: userId,
    weakAreas,
    strengths,
    recommendations,
    aiSummary,
    overallStats,
    generatedAt: new Date(),
  });

  await insight.populate([
    { path: "weakAreas.subject", select: "name" },
    { path: "strengths.subject", select: "name" },
    { path: "recommendations.relatedSubject", select: "name" },
  ]);

  res.status(201).json({
    success: true,
    message: "Insights generated successfully",
    data: insight,
  });
});

// Helper functions for insight generation
function getWeaknessReason(progress) {
  const { quizStats, completionRate } = progress;

  if (quizStats.averageScore < 40) {
    return "Struggling significantly with quiz assessments";
  } else if (quizStats.passedCount === 0) {
    return "Has not passed any quizzes yet";
  } else if (completionRate < 50) {
    return "Low completion rate may affect understanding";
  }
  return "Quiz scores below passing threshold";
}

function getSeverity(averageScore) {
  if (averageScore < 40) return "high";
  if (averageScore < 60) return "medium";
  return "low";
}

function getSuggestedAction(progress) {
  const { quizStats, completionRate } = progress;

  if (completionRate < 50) {
    return "Complete more learning material before attempting quizzes";
  }
  if (quizStats.averageScore < 40) {
    return "Review fundamentals and practice with easier questions";
  }
  return "Practice more quizzes and review incorrect answers";
}

async function buildRecommendations(weakAreas, weakAreasForAI) {
  const recommendations = [];

  // Existing curated resources for each weak subject (non-AI)
  for (const weak of weakAreas.slice(0, 3)) {
    const subject = await Subject.findById(weak.subject).select("name resources");
    if (subject && subject.resources.length > 0) {
      for (const resource of subject.resources.slice(0, 2)) {
        recommendations.push({
          title: resource.title,
          url: resource.url,
          type: resource.type,
          relevance: 90 - weak.averageScore,
          relatedSubject: subject._id,
          isAIGenerated: false,
          description: `Recommended for improving ${subject.name}`,
        });
      }
    }
  }

  if (weakAreasForAI.length === 0) return recommendations;

  // AI-generated YouTube recommendations
  const subjectByName = Object.fromEntries(
    weakAreasForAI.map((w) => [w.subjectName, w.subject])
  );
  const aiRecs = await geminiService.generateRecommendations({ weakAreas: weakAreasForAI });

  for (const rec of aiRecs) {
    const videos = await youtubeService
      .searchVideos({ query: rec.searchQuery, maxResults: 1 })
      .catch(() => []);
    if (videos.length === 0) continue;
    const video = videos[0];
    recommendations.push({
      title: rec.title,
      url: video.url,
      type: "youtube",
      relevance: rec.relevance,
      relatedSubject: subjectByName[rec.topicName],
      isAIGenerated: true,
      description: rec.description,
    });
  }

  return recommendations;
}

/**
 * @desc    Get my latest insight
 * @route   GET /api/v1/insights/latest
 * @access  Private
 */
const getLatestInsight = asyncHandler(async (req, res, next) => {
  const insight = await Insight.getLatestInsight(req.user.id);

  if (!insight) {
    return res.status(200).json({
      success: true,
      data: null,
      message: "No insights generated yet. Generate your first insight!",
    });
  }

  res.status(200).json({
    success: true,
    data: insight,
  });
});

/**
 * @desc    Get all my insights history
 * @route   GET /api/v1/insights
 * @access  Private
 */
const getMyInsights = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [insights, total] = await Promise.all([
    Insight.find({ user: req.user.id })
      .populate("weakAreas.subject", "name")
      .populate("strengths.subject", "name")
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Insight.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({
    success: true,
    count: insights.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: insights,
  });
});

/**
 * @desc    Get single insight
 * @route   GET /api/v1/insights/:id
 * @access  Private
 */
const getInsight = asyncHandler(async (req, res, next) => {
  const insight = await Insight.findById(req.params.id)
    .populate("weakAreas.subject", "name")
    .populate("strengths.subject", "name")
    .populate("recommendations.relatedSubject", "name");

  if (!insight) {
    return next(new AppError("Insight not found", 404));
  }

  // Check ownership or admin
  if (
    insight.user.toString() !== req.user.id &&
    !["admin", "teacher"].includes(req.user.role)
  ) {
    return next(new AppError("Not authorized to view this insight", 403));
  }

  // Mark as viewed if not already
  if (!insight.isViewed && insight.user.toString() === req.user.id) {
    insight.isViewed = true;
    insight.viewedAt = new Date();
    await insight.save();
  }

  res.status(200).json({
    success: true,
    data: insight,
  });
});

/**
 * @desc    Get student's insights (teacher/admin)
 * @route   GET /api/v1/insights/user/:userId
 * @access  Private/Admin/Teacher
 */
const getStudentInsights = asyncHandler(async (req, res, next) => {
  const insights = await Insight.find({ user: req.params.userId })
    .populate("weakAreas.subject", "name")
    .populate("strengths.subject", "name")
    .sort({ generatedAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    count: insights.length,
    data: insights,
  });
});

module.exports = {
  generateInsights,
  getLatestInsight,
  getMyInsights,
  getInsight,
  getStudentInsights,
};
