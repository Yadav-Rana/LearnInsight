const asyncHandler = require("express-async-handler");
const { Syllabus, Subject, Quiz } = require("../models");
const { AppError } = require("../middleware");
const geminiService = require("../services/gemini.service");

/**
 * @desc    Upload/Create syllabus
 * @route   POST /api/v1/syllabus
 * @access  Private
 */
const createSyllabus = asyncHandler(async (req, res, next) => {
  const { subject, title, content, fileName, fileType } = req.body;

  // Verify subject exists
  const subjectExists = await Subject.findById(subject);
  if (!subjectExists) {
    return next(new AppError("Subject not found", 404));
  }

  const syllabus = await Syllabus.create({
    user: req.user.id,
    subject,
    title,
    content,
    fileName: fileName || null,
    fileType: fileType || "manual",
    status: "pending",
  });

  res.status(201).json({
    success: true,
    message: "Syllabus uploaded successfully",
    syllabus,
  });
});

/**
 * @desc    Get all my syllabuses
 * @route   GET /api/v1/syllabus
 * @access  Private
 */
const getMySyllabuses = asyncHandler(async (req, res, next) => {
  const { subject, status } = req.query;

  const query = { user: req.user.id };
  if (subject) query.subject = subject;
  if (status) query.status = status;

  const syllabuses = await Syllabus.find(query)
    .populate("subject", "name")
    .populate("generatedQuizzes", "title isPublished")
    .sort({ uploadedAt: -1 });

  res.status(200).json({
    success: true,
    count: syllabuses.length,
    syllabuses,
  });
});

/**
 * @desc    Get single syllabus
 * @route   GET /api/v1/syllabus/:id
 * @access  Private
 */
const getSyllabus = asyncHandler(async (req, res, next) => {
  const syllabus = await Syllabus.findById(req.params.id)
    .populate("subject", "name description")
    .populate("generatedQuizzes", "title description isPublished totalPoints");

  if (!syllabus) {
    return next(new AppError("Syllabus not found", 404));
  }

  // Check ownership or admin/teacher
  if (
    syllabus.user.toString() !== req.user.id &&
    !["admin", "teacher"].includes(req.user.role)
  ) {
    return next(new AppError("Not authorized to view this syllabus", 403));
  }

  res.status(200).json({
    success: true,
    syllabus,
  });
});

/**
 * @desc    Update syllabus
 * @route   PUT /api/v1/syllabus/:id
 * @access  Private
 */
const updateSyllabus = asyncHandler(async (req, res, next) => {
  const { title, content } = req.body;

  const syllabus = await Syllabus.findById(req.params.id);

  if (!syllabus) {
    return next(new AppError("Syllabus not found", 404));
  }

  // Check ownership
  if (syllabus.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to update this syllabus", 403));
  }

  if (title) syllabus.title = title;
  if (content) {
    syllabus.content = content;
    syllabus.status = "pending"; // Reset status if content changed
    syllabus.extractedTopics = [];
  }

  await syllabus.save();

  res.status(200).json({
    success: true,
    message: "Syllabus updated successfully",
    syllabus,
  });
});

/**
 * @desc    Delete syllabus
 * @route   DELETE /api/v1/syllabus/:id
 * @access  Private
 */
const deleteSyllabus = asyncHandler(async (req, res, next) => {
  const syllabus = await Syllabus.findById(req.params.id);

  if (!syllabus) {
    return next(new AppError("Syllabus not found", 404));
  }

  // Check ownership or admin
  if (syllabus.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to delete this syllabus", 403));
  }

  await syllabus.deleteOne();

  res.status(200).json({
    success: true,
    message: "Syllabus deleted successfully",
  });
});

/**
 * @desc    Generate quiz from syllabus using AI
 * @route   POST /api/v1/syllabus/:id/generate-quiz
 * @access  Private
 */
const generateQuizFromSyllabus = asyncHandler(async (req, res, next) => {
  const { difficulty = "medium", questionCount = 10 } = req.body;

  const syllabus = await Syllabus.findById(req.params.id);

  if (!syllabus) {
    return next(new AppError("Syllabus not found", 404));
  }

  // Check ownership
  if (syllabus.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized", 403));
  }

  // Update status
  syllabus.status = "processing";
  await syllabus.save();

  try {
    const questions = await geminiService.generateQuiz({
      content: syllabus.content,
      count: questionCount,
      difficulty,
    });

    // Create the quiz
    const quiz = await Quiz.create({
      title: `Quiz: ${syllabus.title}`,
      description: `Auto-generated quiz from syllabus: ${syllabus.title}`,
      subject: syllabus.subject,
      questions,
      createdBy: req.user.id,
      isAIGenerated: true,
      difficulty,
      passingScore: 60,
      isPublished: false,
    });

    // Update syllabus
    syllabus.generatedQuizzes.push(quiz._id);
    syllabus.status = "completed";
    await syllabus.save();

    res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        questionCount: quiz.questions.length,
        difficulty: quiz.difficulty,
      },
    });
  } catch (error) {
    syllabus.status = "failed";
    syllabus.processingError = error.message;
    await syllabus.save();

    return next(new AppError("Failed to generate quiz: " + error.message, 500));
  }
});

/**
 * @desc    Extract topics from syllabus using AI
 * @route   POST /api/v1/syllabus/:id/extract-topics
 * @access  Private
 */
const extractTopics = asyncHandler(async (req, res, next) => {
  const syllabus = await Syllabus.findById(req.params.id);

  if (!syllabus) {
    return next(new AppError("Syllabus not found", 404));
  }

  const extractedTopics = await geminiService.extractTopics({ content: syllabus.content });

  syllabus.extractedTopics = extractedTopics;
  await syllabus.save();

  res.status(200).json({
    success: true,
    message: "Topics extracted successfully",
    extractedTopics,
  });
});

module.exports = {
  createSyllabus,
  getMySyllabuses,
  getSyllabus,
  updateSyllabus,
  deleteSyllabus,
  generateQuizFromSyllabus,
  extractTopics,
};
