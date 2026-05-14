const asyncHandler = require("express-async-handler");
const { Progress, Subject, User } = require("../models");
const { AppError } = require("../middleware");

/**
 * @desc    Get my progress (all subjects)
 * @route   GET /api/v1/progress
 * @access  Private
 */
const getMyProgress = asyncHandler(async (req, res, next) => {
  const progress = await Progress.find({ user: req.user.id })
    .populate("subject", "name description level parent")
    .sort({ lastActivity: -1 });

  // Calculate overall stats
  const overallStats = {
    totalSubjects: progress.length,
    averageCompletion: 0,
    averageQuizScore: 0,
    totalTimeSpent: 0,
  };

  if (progress.length > 0) {
    overallStats.averageCompletion = Math.round(
      progress.reduce((sum, p) => sum + p.completionRate, 0) / progress.length
    );
    const withQuizStats = progress.filter((p) => p.quizStats.totalAttempts > 0);
    if (withQuizStats.length > 0) {
      overallStats.averageQuizScore = Math.round(
        withQuizStats.reduce((sum, p) => sum + p.quizStats.averageScore, 0) /
          withQuizStats.length
      );
    }
    overallStats.totalTimeSpent = progress.reduce(
      (sum, p) => sum + p.totalTimeSpent,
      0
    );
  }

  res.status(200).json({
    success: true,
    overallStats,
    data: progress,
  });
});

/**
 * @desc    Get progress for a specific subject
 * @route   GET /api/v1/progress/subject/:subjectId
 * @access  Private
 */
const getProgressBySubject = asyncHandler(async (req, res, next) => {
  let progress = await Progress.findOne({
    user: req.user.id,
    subject: req.params.subjectId,
  })
    .populate("subject", "name description resources")
    .populate({
      path: "quizAttempts",
      select: "quiz score percentage passed completedAt",
      populate: { path: "quiz", select: "title" },
      options: { sort: { completedAt: -1 }, limit: 10 },
    });

  if (!progress) {
    // Return empty progress
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) {
      return next(new AppError("Subject not found", 404));
    }

    return res.status(200).json({
      success: true,
      data: {
        subject: {
          _id: subject._id,
          name: subject.name,
          description: subject.description,
        },
        completionRate: 0,
        totalTimeSpent: 0,
        quizStats: {
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          passedCount: 0,
        },
        viewedResources: [],
        notes: "",
      },
    });
  }

  res.status(200).json({
    success: true,
    data: progress,
  });
});

/**
 * @desc    Update progress for a subject
 * @route   PUT /api/v1/progress/subject/:subjectId
 * @access  Private
 */
const updateProgress = asyncHandler(async (req, res, next) => {
  const { completionRate, timeSpent, notes } = req.body;

  let progress = await Progress.findOne({
    user: req.user.id,
    subject: req.params.subjectId,
  });

  if (!progress) {
    // Create new progress
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) {
      return next(new AppError("Subject not found", 404));
    }

    progress = await Progress.create({
      user: req.user.id,
      subject: req.params.subjectId,
      completionRate: completionRate || 0,
      totalTimeSpent: timeSpent || 0,
      notes: notes || "",
    });
  } else {
    // Update existing
    if (completionRate !== undefined) progress.completionRate = completionRate;
    if (timeSpent) progress.totalTimeSpent += timeSpent;
    if (notes !== undefined) progress.notes = notes;
    progress.lastActivity = new Date();
    await progress.save();
  }

  await progress.populate("subject", "name description");

  res.status(200).json({
    success: true,
    message: "Progress updated successfully",
    progress,
  });
});

/**
 * @desc    Mark resource as viewed
 * @route   POST /api/v1/progress/subject/:subjectId/resource
 * @access  Private
 */
const markResourceViewed = asyncHandler(async (req, res, next) => {
  const { resourceId } = req.body;

  let progress = await Progress.findOne({
    user: req.user.id,
    subject: req.params.subjectId,
  });

  if (!progress) {
    progress = await Progress.create({
      user: req.user.id,
      subject: req.params.subjectId,
      viewedResources: [{ resourceId, viewedAt: new Date() }],
    });
  } else {
    // Check if already viewed
    const alreadyViewed = progress.viewedResources.some(
      (r) => r.resourceId.toString() === resourceId
    );

    if (!alreadyViewed) {
      progress.viewedResources.push({ resourceId, viewedAt: new Date() });
      progress.lastActivity = new Date();
      await progress.save();
    }
  }

  res.status(200).json({
    success: true,
    message: "Resource marked as viewed",
    viewedResources: progress.viewedResources,
  });
});

/**
 * @desc    Get student progress (teacher/admin view)
 * @route   GET /api/v1/progress/user/:userId
 * @access  Private/Admin/Teacher
 */
const getStudentProgress = asyncHandler(async (req, res, next) => {
  const student = await User.findById(req.params.userId).select(
    "name email role teacher"
  );

  if (!student) {
    return next(new AppError("User not found", 404));
  }

  // Teachers can only see progress for their own students
  if (
    req.user.role === "teacher" &&
    (student.role !== "student" ||
      !student.teacher ||
      student.teacher.toString() !== req.user.id)
  ) {
    return next(new AppError("Not authorized to view this student", 403));
  }

  const progress = await Progress.find({ user: req.params.userId })
    .populate("subject", "name description level")
    .sort({ lastActivity: -1 });

  res.status(200).json({
    success: true,
    student,
    data: progress,
  });
});

/**
 * @desc    Get progress for all students in a subject (teacher/admin)
 * @route   GET /api/v1/progress/subject/:subjectId/students
 * @access  Private/Admin/Teacher
 */
const getSubjectStudentsProgress = asyncHandler(async (req, res, next) => {
  // Teachers only see progress rows for their own students.
  const userFilter = {};
  if (req.user.role === "teacher") {
    const myStudents = await User.find({
      role: "student",
      teacher: req.user.id,
    }).select("_id");
    userFilter.user = { $in: myStudents.map((s) => s._id) };
  }

  const progress = await Progress.find({
    subject: req.params.subjectId,
    ...userFilter,
  })
    .populate("user", "name email avatar")
    .sort({ "quizStats.averageScore": -1 });

  // Calculate class stats
  const stats = {
    totalStudents: progress.length,
    averageCompletion: 0,
    averageQuizScore: 0,
  };

  if (progress.length > 0) {
    stats.averageCompletion = Math.round(
      progress.reduce((sum, p) => sum + p.completionRate, 0) / progress.length
    );
    const withQuizStats = progress.filter((p) => p.quizStats.totalAttempts > 0);
    if (withQuizStats.length > 0) {
      stats.averageQuizScore = Math.round(
        withQuizStats.reduce((sum, p) => sum + p.quizStats.averageScore, 0) /
          withQuizStats.length
      );
    }
  }

  res.status(200).json({
    success: true,
    stats,
    data: progress,
  });
});

/**
 * @desc    Get leaderboard for a subject
 * @route   GET /api/v1/progress/subject/:subjectId/leaderboard
 * @access  Private
 */
const getLeaderboard = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const leaderboard = await Progress.find({
    subject: req.params.subjectId,
    "quizStats.totalAttempts": { $gt: 0 },
  })
    .populate("user", "name avatar")
    .sort({ "quizStats.averageScore": -1, "quizStats.totalAttempts": -1 })
    .limit(parseInt(limit))
    .select("user quizStats.averageScore quizStats.bestScore quizStats.totalAttempts");

  // Find current user's rank
  const userProgress = await Progress.findOne({
    user: req.user.id,
    subject: req.params.subjectId,
  });

  let userRank = null;
  if (userProgress && userProgress.quizStats.totalAttempts > 0) {
    const betterCount = await Progress.countDocuments({
      subject: req.params.subjectId,
      "quizStats.averageScore": { $gt: userProgress.quizStats.averageScore },
    });
    userRank = betterCount + 1;
  }

  res.status(200).json({
    success: true,
    leaderboard,
    userRank,
  });
});

module.exports = {
  getMyProgress,
  getProgressBySubject,
  updateProgress,
  markResourceViewed,
  getStudentProgress,
  getSubjectStudentsProgress,
  getLeaderboard,
};
