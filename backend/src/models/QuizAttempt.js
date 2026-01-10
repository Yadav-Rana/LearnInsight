const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedAnswer: {
      type: Number,
      required: true,
      min: 0,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    timeTaken: {
      type: Number, // in seconds
      default: null,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ user: 1, completedAt: -1 });
quizAttemptSchema.index({ quiz: 1 });

// Static method to get user's best attempt for a quiz
quizAttemptSchema.statics.getBestAttempt = async function (userId, quizId) {
  return this.findOne({ user: userId, quiz: quizId })
    .sort({ percentage: -1 })
    .limit(1);
};

// Static method to get user's attempt count for a quiz
quizAttemptSchema.statics.getAttemptCount = async function (userId, quizId) {
  return this.countDocuments({ user: userId, quiz: quizId });
};

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
