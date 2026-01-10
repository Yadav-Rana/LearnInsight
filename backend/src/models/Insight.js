const mongoose = require("mongoose");

const weakAreaSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    suggestedAction: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const recommendationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["youtube", "article", "pdf", "course", "other"],
      default: "other",
    },
    relevance: {
      type: Number, // 0-100 relevance score
      default: 50,
      min: 0,
      max: 100,
    },
    relatedSubject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const insightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weakAreas: [weakAreaSchema],
    strengths: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
        reason: String,
        averageScore: Number,
      },
    ],
    recommendations: [recommendationSchema],
    aiSummary: {
      type: String,
      default: "",
    },
    // Overall stats at the time of insight generation
    overallStats: {
      totalSubjects: {
        type: Number,
        default: 0,
      },
      averageCompletionRate: {
        type: Number,
        default: 0,
      },
      averageQuizScore: {
        type: Number,
        default: 0,
      },
      totalTimeSpent: {
        type: Number,
        default: 0,
      },
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    // Track if user has viewed this insight
    isViewed: {
      type: Boolean,
      default: false,
    },
    viewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
insightSchema.index({ user: 1, generatedAt: -1 });
insightSchema.index({ user: 1 });

// Static method to get latest insight for a user
insightSchema.statics.getLatestInsight = async function (userId) {
  return this.findOne({ user: userId })
    .sort({ generatedAt: -1 })
    .populate("weakAreas.subject", "name")
    .populate("strengths.subject", "name")
    .populate("recommendations.relatedSubject", "name");
};

module.exports = mongoose.model("Insight", insightSchema);
