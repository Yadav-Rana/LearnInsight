const asyncHandler = require("express-async-handler");
const { Subject } = require("../models");
const { AppError } = require("../middleware");

/**
 * @desc    Get all subjects (with optional filtering)
 * @route   GET /api/v1/subjects
 * @access  Private
 */
const getSubjects = asyncHandler(async (req, res, next) => {
  const { parent, level, search, tree } = req.query;

  // Build query
  const query = { isActive: true };

  if (parent === "null" || parent === "root") {
    query.parent = null;
  } else if (parent) {
    query.parent = parent;
  }

  if (level !== undefined) {
    query.level = parseInt(level);
  }

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  let subjects;

  if (tree === "true") {
    // Get hierarchical tree structure
    subjects = await Subject.find({ ...query, parent: null })
      .populate({
        path: "children",
        populate: {
          path: "children",
          populate: { path: "children" },
        },
      })
      .populate("createdBy", "name")
      .sort({ order: 1, name: 1 });
  } else {
    subjects = await Subject.find(query)
      .populate("parent", "name")
      .populate("createdBy", "name")
      .sort({ order: 1, name: 1 });
  }

  res.status(200).json({
    success: true,
    count: subjects.length,
    subjects,
  });
});

/**
 * @desc    Get single subject
 * @route   GET /api/v1/subjects/:id
 * @access  Private
 */
const getSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id)
    .populate("parent", "name")
    .populate("createdBy", "name")
    .populate({
      path: "children",
      select: "name description level order",
    });

  if (!subject) {
    return next(new AppError("Subject not found", 404));
  }

  res.status(200).json({
    success: true,
    subject,
  });
});

/**
 * @desc    Create subject
 * @route   POST /api/v1/subjects
 * @access  Private/Admin/Teacher
 */
const createSubject = asyncHandler(async (req, res, next) => {
  const { name, description, icon, parent, level, order } = req.body;

  // If parent is provided, verify it exists and set level
  let parentLevel = -1;
  if (parent) {
    const parentSubject = await Subject.findById(parent);
    if (!parentSubject) {
      return next(new AppError("Parent subject not found", 404));
    }
    parentLevel = parentSubject.level;
  }

  const subject = await Subject.create({
    name,
    description,
    icon,
    parent: parent || null,
    level: level !== undefined ? level : parentLevel + 1,
    order: order || 0,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Subject created successfully",
    subject,
  });
});

/**
 * @desc    Update subject
 * @route   PUT /api/v1/subjects/:id
 * @access  Private/Admin/Teacher
 */
const updateSubject = asyncHandler(async (req, res, next) => {
  const { name, description, icon, parent, level, order, isActive } = req.body;

  let subject = await Subject.findById(req.params.id);

  if (!subject) {
    return next(new AppError("Subject not found", 404));
  }

  // Check ownership or admin
  if (
    subject.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(new AppError("Not authorized to update this subject", 403));
  }

  // Prevent setting parent to self or descendant
  if (parent && parent === req.params.id) {
    return next(new AppError("Subject cannot be its own parent", 400));
  }

  // Update fields
  if (name) subject.name = name;
  if (description !== undefined) subject.description = description;
  if (icon !== undefined) subject.icon = icon;
  if (parent !== undefined) subject.parent = parent || null;
  if (level !== undefined) subject.level = level;
  if (order !== undefined) subject.order = order;
  if (isActive !== undefined) subject.isActive = isActive;

  await subject.save();

  res.status(200).json({
    success: true,
    message: "Subject updated successfully",
    subject,
  });
});

/**
 * @desc    Delete subject
 * @route   DELETE /api/v1/subjects/:id
 * @access  Private/Admin
 */
const deleteSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    return next(new AppError("Subject not found", 404));
  }

  // Check if subject has children
  const childCount = await Subject.countDocuments({ parent: req.params.id });
  if (childCount > 0) {
    return next(
      new AppError(
        "Cannot delete subject with children. Delete or move children first.",
        400
      )
    );
  }

  await subject.deleteOne();

  res.status(200).json({
    success: true,
    message: "Subject deleted successfully",
  });
});

/**
 * @desc    Add resource to subject
 * @route   POST /api/v1/subjects/:id/resources
 * @access  Private/Admin/Teacher
 */
const addResource = asyncHandler(async (req, res, next) => {
  const { title, url, type, description } = req.body;

  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    return next(new AppError("Subject not found", 404));
  }

  subject.resources.push({
    title,
    url,
    type: type || "other",
    description: description || "",
  });

  await subject.save();

  res.status(201).json({
    success: true,
    message: "Resource added successfully",
    resources: subject.resources,
  });
});

/**
 * @desc    Remove resource from subject
 * @route   DELETE /api/v1/subjects/:id/resources/:resourceId
 * @access  Private/Admin/Teacher
 */
const removeResource = asyncHandler(async (req, res, next) => {
  const { id, resourceId } = req.params;

  const subject = await Subject.findById(id);

  if (!subject) {
    return next(new AppError("Subject not found", 404));
  }

  const resourceIndex = subject.resources.findIndex(
    (r) => r._id.toString() === resourceId
  );

  if (resourceIndex === -1) {
    return next(new AppError("Resource not found", 404));
  }

  subject.resources.splice(resourceIndex, 1);
  await subject.save();

  res.status(200).json({
    success: true,
    message: "Resource removed successfully",
    resources: subject.resources,
  });
});

/**
 * @desc    Get subject hierarchy (breadcrumb)
 * @route   GET /api/v1/subjects/:id/hierarchy
 * @access  Private
 */
const getSubjectHierarchy = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    return next(new AppError("Subject not found", 404));
  }

  const hierarchy = [subject];
  let currentSubject = subject;

  // Walk up the tree
  while (currentSubject.parent) {
    currentSubject = await Subject.findById(currentSubject.parent);
    if (currentSubject) {
      hierarchy.unshift(currentSubject);
    } else {
      break;
    }
  }

  res.status(200).json({
    success: true,
    hierarchy: hierarchy.map((s) => ({
      id: s._id,
      name: s.name,
      level: s.level,
    })),
  });
});

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addResource,
  removeResource,
  getSubjectHierarchy,
};
