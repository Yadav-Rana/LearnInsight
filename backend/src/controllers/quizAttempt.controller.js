const asyncHandler = require("express-async-handler");
const { QuizAttempt, Quiz, Progress, User } = require("../models");
const { AppError } = require("../middleware");
const { canViewContent } = require("../utils/visibilityFilter");

/**
 * @desc    Submit quiz attempt
 * @route   POST /api/v1/attempts
 * @access  Private
 */
const submitAttempt = asyncHandler(async (req, res, next) => {
  const { quizId, answers, startedAt } = req.body;

  // Get the quiz with correct answers
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return next(new AppError("Quiz not found", 404));
  }

  if (!canViewContent(quiz, req.user)) {
    return next(new AppError("Quiz not found", 404));
  }

  if (!quiz.isPublished && req.user.role === "student") {
    return next(new AppError("Quiz is not available", 404));
  }

  // Calculate score
  let score = 0;
  const processedAnswers = [];

  for (const answer of answers) {
    const question = quiz.questions.id(answer.questionId);

    if (!question) {
      continue;
    }

    const isCorrect = question.correctAnswer === answer.selectedAnswer;
    const pointsEarned = isCorrect ? question.points : 0;
    score += pointsEarned;

    processedAnswers.push({
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
      isCorrect,
      pointsEarned,
    });
  }

  const percentage = Math.round((score / quiz.totalPoints) * 100);
  const passed = percentage >= quiz.passingScore;
  const completedAt = new Date();
  const timeTaken = Math.round((completedAt - new Date(startedAt)) / 1000);

  // Create attempt
  const attempt = await QuizAttempt.create({
    user: req.user.id,
    quiz: quizId,
    answers: processedAnswers,
    score,
    totalPoints: quiz.totalPoints,
    percentage,
    passed,
    timeTaken,
    startedAt: new Date(startedAt),
    completedAt,
  });

  // Update progress
  await updateProgressAfterAttempt(req.user.id, quiz.subject, attempt._id);

  // Populate for response
  await attempt.populate("quiz", "title subject");

  // Build answer review if showAnswers is enabled
  let answerReview = null;
  if (quiz.showAnswers !== false) {
    answerReview = quiz.questions.map((q) => {
      const userAnswer = processedAnswers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );
      return {
        questionId: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
        isCorrect: userAnswer ? userAnswer.isCorrect : false,
        explanation: q.explanation || "",
      };
    });
  }

  res.status(201).json({
    success: true,
    message: passed ? "Congratulations! You passed!" : "Keep practicing!",
    data: {
      id: attempt._id,
      score,
      totalPoints: quiz.totalPoints,
      percentage,
      passed,
      timeTaken,
      correctAnswers: processedAnswers.filter((a) => a.isCorrect).length,
      totalQuestions: quiz.questions.length,
      showAnswers: quiz.showAnswers !== false,
      answerReview,
    },
  });
});

/**
 * Helper function to update progress after quiz attempt
 */
const updateProgressAfterAttempt = async (userId, subjectId, attemptId) => {
  let progress = await Progress.findOne({ user: userId, subject: subjectId });

  if (!progress) {
    progress = await Progress.create({
      user: userId,
      subject: subjectId,
      quizAttempts: [attemptId],
    });
  } else {
    progress.quizAttempts.push(attemptId);
    progress.lastActivity = new Date();
    await progress.save();
  }

  // Update quiz stats
  await progress.updateQuizStats();
};

/**
 * @desc    Get user's attempts
 * @route   GET /api/v1/attempts
 * @access  Private
 */
const getMyAttempts = asyncHandler(async (req, res, next) => {
  const { quizId, page = 1, limit = 10 } = req.query;

  const query = {};
  // Students see only their own; teachers see only their own students; admins see all
  if (req.user.role === "student") {
    query.user = req.user.id;
  } else if (req.user.role === "teacher") {
    const myStudents = await User.find({
      role: "student",
      teacher: req.user.id,
    }).select("_id");
    query.user = { $in: myStudents.map((s) => s._id) };
  }
  if (quizId) query.quiz = quizId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [attempts, total] = await Promise.all([
    QuizAttempt.find(query)
      .populate("quiz", "title subject difficulty")
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    QuizAttempt.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: attempts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: attempts,
  });
});

/**
 * @desc    Get single attempt with details
 * @route   GET /api/v1/attempts/:id
 * @access  Private
 */
const getAttempt = asyncHandler(async (req, res, next) => {
  const attempt = await QuizAttempt.findById(req.params.id)
    .populate({
      path: "quiz",
      select: "title description subject questions",
      populate: { path: "subject", select: "name" },
    });

  if (!attempt) {
    return next(new AppError("Attempt not found", 404));
  }

  const isOwner = attempt.user.toString() === req.user.id;
  if (!isOwner) {
    if (req.user.role === "admin") {
      // allow
    } else if (req.user.role === "teacher") {
      const student = await User.findById(attempt.user).select("teacher");
      if (
        !student ||
        !student.teacher ||
        student.teacher.toString() !== req.user.id
      ) {
        return next(new AppError("Not authorized to view this attempt", 403));
      }
    } else {
      return next(new AppError("Not authorized to view this attempt", 403));
    }
  }

  res.status(200).json({
    success: true,
    data: attempt,
  });
});

/**
 * @desc    Get attempts for a specific quiz (teacher/admin)
 * @route   GET /api/v1/attempts/quiz/:quizId
 * @access  Private/Admin/Teacher
 */
const getAttemptsByQuiz = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const attemptFilter = { quiz: req.params.quizId };
  // Teachers only see attempts from their own students.
  if (req.user.role === "teacher") {
    const myStudents = await User.find({
      role: "student",
      teacher: req.user.id,
    }).select("_id");
    attemptFilter.user = { $in: myStudents.map((s) => s._id) };
  }

  const [attempts, total] = await Promise.all([
    QuizAttempt.find(attemptFilter)
      .populate("user", "name email")
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    QuizAttempt.countDocuments(attemptFilter),
  ]);

  // Calculate stats
  const stats = {
    totalAttempts: total,
    averageScore: 0,
    passRate: 0,
    highestScore: 0,
    lowestScore: 100,
  };

  if (attempts.length > 0) {
    const allAttempts = await QuizAttempt.find(attemptFilter);
    const scores = allAttempts.map((a) => a.percentage);
    stats.averageScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
    stats.passRate = Math.round(
      (allAttempts.filter((a) => a.passed).length / allAttempts.length) * 100
    );
    stats.highestScore = Math.max(...scores);
    stats.lowestScore = Math.min(...scores);
  }

  res.status(200).json({
    success: true,
    count: attempts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    stats,
    data: attempts,
  });
});

/**
 * @desc    Get user's best attempt for a quiz
 * @route   GET /api/v1/attempts/quiz/:quizId/best
 * @access  Private
 */
const getBestAttempt = asyncHandler(async (req, res, next) => {
  const attempt = await QuizAttempt.getBestAttempt(
    req.user.id,
    req.params.quizId
  );

  if (!attempt) {
    return res.status(200).json({
      success: true,
      data: null,
      message: "No attempts found for this quiz",
    });
  }

  res.status(200).json({
    success: true,
    data: attempt,
  });
});

/**
 * @desc    Get user's attempt history stats
 * @route   GET /api/v1/attempts/stats
 * @access  Private
 */
const getMyStats = asyncHandler(async (req, res, next) => {
  const attempts = await QuizAttempt.find({ user: req.user.id });

  const stats = {
    totalAttempts: attempts.length,
    totalPassed: attempts.filter((a) => a.passed).length,
    averageScore: 0,
    totalTimeSpent: 0,
    quizzesTaken: new Set(attempts.map((a) => a.quiz.toString())).size,
  };

  if (attempts.length > 0) {
    stats.averageScore = Math.round(
      attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
    );
    stats.totalTimeSpent = attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
  }

  res.status(200).json({
    success: true,
    stats,
  });
});

module.exports = {
  submitAttempt,
  getMyAttempts,
  getAttempt,
  getAttemptsByQuiz,
  getBestAttempt,
  getMyStats,
};
