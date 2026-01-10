const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
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
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    quizAttempts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizAttempt",
      },
    ],
    // Track quiz performance for this subject
    quizStats: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      bestScore: {
        type: Number,
        default: 0,
      },
      passedCount: {
        type: Number,
        default: 0,
      },
    },
    // Track which resources have been viewed
    viewedResources: [
      {
        resourceId: mongoose.Schema.Types.ObjectId,
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Notes or bookmarks for this subject
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one progress record per user per subject
progressSchema.index({ user: 1, subject: 1 }, { unique: true });
progressSchema.index({ user: 1 });
progressSchema.index({ lastActivity: -1 });

// Method to update quiz stats
progressSchema.methods.updateQuizStats = async function () {
  const QuizAttempt = mongoose.model("QuizAttempt");
  const Quiz = mongoose.model("Quiz");

  // Get all quizzes for this subject
  const quizzes = await Quiz.find({ subject: this.subject }).select("_id");
  const quizIds = quizzes.map((q) => q._id);

  // Get all attempts for these quizzes by this user
  const attempts = await QuizAttempt.find({
    user: this.user,
    quiz: { $in: quizIds },
  });

  if (attempts.length > 0) {
    this.quizStats.totalAttempts = attempts.length;
    this.quizStats.averageScore =
      attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;
    this.quizStats.bestScore = Math.max(...attempts.map((a) => a.percentage));
    this.quizStats.passedCount = attempts.filter((a) => a.passed).length;
  }

  return this.save();
};

module.exports = mongoose.model("Progress", progressSchema);
