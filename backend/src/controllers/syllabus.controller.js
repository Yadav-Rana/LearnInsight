const path = require("path");
const asyncHandler = require("express-async-handler");
const { Syllabus, Subject, Quiz } = require("../models");
const { AppError } = require("../middleware");
const geminiService = require("../services/gemini.service");
const documentExtractor = require("../services/documentExtractor.service");

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
 * @desc    Upload a syllabus document and extract its text
 * @route   POST /api/v1/syllabus/upload
 * @access  Private
 *
 * Accepts multipart/form-data with fields:
 *   - file:    PDF | DOCX | TXT (handled by upload middleware)
 *   - subject: Mongo ObjectId
 *   - title:   optional; falls back to the filename (without extension)
 */
const uploadSyllabus = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded. Attach a PDF, DOCX, or TXT file.", 400));
  }

  const { subject, title } = req.body;
  if (!subject) {
    return next(new AppError("Subject is required", 400));
  }

  const subjectExists = await Subject.findById(subject);
  if (!subjectExists) {
    return next(new AppError("Subject not found", 404));
  }

  let extracted;
  try {
    extracted = await documentExtractor.extractText(req.file.buffer, {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    return next(new AppError(err.message || "Failed to read the document", 400));
  }

  const fallbackTitle = path
    .parse(req.file.originalname || "")
    .name.trim()
    .slice(0, 200);
  const resolvedTitle = (title && title.trim()) || fallbackTitle || "Untitled Syllabus";

  const syllabus = await Syllabus.create({
    user: req.user.id,
    subject,
    title: resolvedTitle,
    content: extracted.text,
    fileName: req.file.originalname,
    fileType: extracted.fileType,
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

    return next(new AppError("AI quiz generation failed: " + error.message, 502));
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

  let extractedTopics;
  try {
    extractedTopics = await geminiService.extractTopics({ content: syllabus.content });
  } catch (error) {
    return next(new AppError("AI topic extraction failed: " + error.message, 502));
  }

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
  uploadSyllabus,
  getMySyllabuses,
  getSyllabus,
  updateSyllabus,
  deleteSyllabus,
  generateQuizFromSyllabus,
  extractTopics,
};
