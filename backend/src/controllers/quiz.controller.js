const asyncHandler = require("express-async-handler");
const { Quiz, Subject } = require("../models");
const { AppError } = require("../middleware");

/**
 * @desc    Get all quizzes
 * @route   GET /api/v1/quizzes
 * @access  Private
 */
const getQuizzes = asyncHandler(async (req, res, next) => {
  const {
    subject,
    difficulty,
    isPublished,
    isAIGenerated,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  // Build query
  const query = {};

  // Students can only see published quizzes
  if (req.user.role === "student") {
    query.isPublished = true;
  } else if (isPublished !== undefined) {
    query.isPublished = isPublished === "true";
  }

  if (subject) query.subject = subject;
  if (difficulty) query.difficulty = difficulty;
  if (isAIGenerated !== undefined) query.isAIGenerated = isAIGenerated === "true";

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [quizzes, total] = await Promise.all([
    Quiz.find(query)
      .populate("subject", "name")
      .populate("createdBy", "name")
      .select("-questions.correctAnswer -questions.explanation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Quiz.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: quizzes.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    quizzes,
  });
});

/**
 * @desc    Get single quiz
 * @route   GET /api/v1/quizzes/:id
 * @access  Private
 */
const getQuiz = asyncHandler(async (req, res, next) => {
  let quiz = await Quiz.findById(req.params.id)
    .populate("subject", "name description")
    .populate("createdBy", "name");

  if (!quiz) {
    return next(new AppError("Quiz not found", 404));
  }

  // Students can only view published quizzes
  if (req.user.role === "student" && !quiz.isPublished) {
    return next(new AppError("Quiz not found", 404));
  }

  // Hide correct answers for students
  if (req.user.role === "student") {
    quiz = quiz.toObject();
    quiz.questions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      points: q.points,
    }));
  }

  res.status(200).json({
    success: true,
    quiz,
  });
});

/**
 * @desc    Create quiz
 * @route   POST /api/v1/quizzes
 * @access  Private/Admin/Teacher
 */
const createQuiz = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    subject,
    questions,
    difficulty,
    timeLimit,
    passingScore,
  } = req.body;

  // Verify subject exists
  const subjectExists = await Subject.findById(subject);
  if (!subjectExists) {
    return next(new AppError("Subject not found", 404));
  }

  const quiz = await Quiz.create({
    title,
    description,
    subject,
    questions,
    difficulty: difficulty || "medium",
    timeLimit: timeLimit || null,
    passingScore: passingScore || 60,
    createdBy: req.user.id,
    isAIGenerated: false,
  });

  res.status(201).json({
    success: true,
    message: "Quiz created successfully",
    quiz,
  });
});

/**
 * @desc    Update quiz
 * @route   PUT /api/v1/quizzes/:id
 * @access  Private/Admin/Teacher
 */
const updateQuiz = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    subject,
    questions,
    difficulty,
    timeLimit,
    passingScore,
    isPublished,
  } = req.body;

  let quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new AppError("Quiz not found", 404));
  }

  // Check ownership or admin
  if (quiz.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to update this quiz", 403));
  }

  // Verify subject if being changed
  if (subject && subject !== quiz.subject.toString()) {
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return next(new AppError("Subject not found", 404));
    }
  }

  // Update fields
  if (title) quiz.title = title;
  if (description !== undefined) quiz.description = description;
  if (subject) quiz.subject = subject;
  if (questions) quiz.questions = questions;
  if (difficulty) quiz.difficulty = difficulty;
  if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
  if (passingScore !== undefined) quiz.passingScore = passingScore;
  if (isPublished !== undefined) quiz.isPublished = isPublished;

  await quiz.save();

  res.status(200).json({
    success: true,
    message: "Quiz updated successfully",
    quiz,
  });
});

/**
 * @desc    Delete quiz
 * @route   DELETE /api/v1/quizzes/:id
 * @access  Private/Admin/Teacher
 */
const deleteQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new AppError("Quiz not found", 404));
  }

  // Check ownership or admin
  if (quiz.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to delete this quiz", 403));
  }

  await quiz.deleteOne();

  res.status(200).json({
    success: true,
    message: "Quiz deleted successfully",
  });
});

/**
 * @desc    Publish/Unpublish quiz
 * @route   PUT /api/v1/quizzes/:id/publish
 * @access  Private/Admin/Teacher
 */
const togglePublish = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new AppError("Quiz not found", 404));
  }

  // Check ownership or admin
  if (quiz.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to update this quiz", 403));
  }

  quiz.isPublished = !quiz.isPublished;
  await quiz.save();

  res.status(200).json({
    success: true,
    message: `Quiz ${quiz.isPublished ? "published" : "unpublished"} successfully`,
    isPublished: quiz.isPublished,
  });
});

/**
 * @desc    Get quizzes by subject
 * @route   GET /api/v1/quizzes/subject/:subjectId
 * @access  Private
 */
const getQuizzesBySubject = asyncHandler(async (req, res, next) => {
  const query = { subject: req.params.subjectId };

  // Students can only see published quizzes
  if (req.user.role === "student") {
    query.isPublished = true;
  }

  const quizzes = await Quiz.find(query)
    .populate("createdBy", "name")
    .select("title description difficulty timeLimit totalPoints isPublished createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: quizzes.length,
    quizzes,
  });
});

/**
 * @desc    Duplicate quiz
 * @route   POST /api/v1/quizzes/:id/duplicate
 * @access  Private/Admin/Teacher
 */
const duplicateQuiz = asyncHandler(async (req, res, next) => {
  const originalQuiz = await Quiz.findById(req.params.id);

  if (!originalQuiz) {
    return next(new AppError("Quiz not found", 404));
  }

  const duplicatedQuiz = await Quiz.create({
    title: `${originalQuiz.title} (Copy)`,
    description: originalQuiz.description,
    subject: originalQuiz.subject,
    questions: originalQuiz.questions,
    difficulty: originalQuiz.difficulty,
    timeLimit: originalQuiz.timeLimit,
    passingScore: originalQuiz.passingScore,
    createdBy: req.user.id,
    isAIGenerated: false,
    isPublished: false,
  });

  res.status(201).json({
    success: true,
    message: "Quiz duplicated successfully",
    quiz: duplicatedQuiz,
  });
});

module.exports = {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublish,
  getQuizzesBySubject,
  duplicateQuiz,
};
