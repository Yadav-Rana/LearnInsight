const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: {
        validator: function (arr) {
          return arr.length >= 2 && arr.length <= 6;
        },
        message: "Questions must have between 2 and 6 options",
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: 0,
    },
    explanation: {
      type: String,
      default: "",
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (arr) {
          return arr.length >= 1;
        },
        message: "Quiz must have at least 1 question",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    timeLimit: {
      type: Number,
      default: null, // null means no time limit, otherwise in minutes
      min: 1,
    },
    passingScore: {
      type: Number,
      default: 60, // percentage
      min: 0,
      max: 100,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total points before saving
quizSchema.pre("save", function () {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }
});

// Index for faster queries
quizSchema.index({ subject: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ isPublished: 1 });
quizSchema.index({ difficulty: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
