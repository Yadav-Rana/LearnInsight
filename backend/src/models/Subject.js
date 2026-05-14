const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Resource URL is required"],
    },
    type: {
      type: String,
      enum: ["youtube", "article", "pdf", "other"],
      default: "other",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    icon: {
      type: String,
      default: null,
    },
    // Flexible hierarchy: null = root subject, otherwise points to parent
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    // Level in hierarchy: 0 = root (e.g., Math), 1 = chapter, 2 = topic, etc.
    level: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Order for display purposes
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resources: [resourceSchema],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to get children subjects
subjectSchema.virtual("children", {
  ref: "Subject",
  localField: "_id",
  foreignField: "parent",
});

// Index for faster queries
subjectSchema.index({ parent: 1 });
subjectSchema.index({ level: 1 });
subjectSchema.index({ createdBy: 1 });
subjectSchema.index({ visibility: 1 });

module.exports = mongoose.model("Subject", subjectSchema);
