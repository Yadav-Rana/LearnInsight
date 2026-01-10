const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Syllabus title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Syllabus content is required"],
    },
    fileName: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      enum: ["pdf", "text", "docx", "manual"],
      default: "manual",
    },
    // Track quizzes generated from this syllabus
    generatedQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    // Parsed topics extracted from syllabus (by AI)
    extractedTopics: [
      {
        topic: String,
        subtopics: [String],
      },
    ],
    // Processing status
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processingError: {
      type: String,
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
syllabusSchema.index({ user: 1, subject: 1 });
syllabusSchema.index({ user: 1 });
syllabusSchema.index({ status: 1 });

module.exports = mongoose.model("Syllabus", syllabusSchema);
