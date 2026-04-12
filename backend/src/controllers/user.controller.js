const asyncHandler = require("express-async-handler");
const { User } = require("../models");
const { AppError } = require("../middleware");

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res, next) => {
  const { role, isActive, search, page = 1, limit = 10 } = req.query;

  // Build query
  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === "true";
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .populate("enrolledSubjects", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    users,
  });
});

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("enrolledSubjects", "name description");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Update user (Admin)
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, isActive, avatar } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email is already taken", 400));
    }
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      avatar: user.avatar,
    },
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Prevent deleting self
  if (user._id.toString() === req.user.id) {
    return next(new AppError("You cannot delete yourself", 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

/**
 * @desc    Enroll user in a subject
 * @route   POST /api/v1/users/:id/enroll
 * @access  Private/Admin/Teacher
 */
const enrollInSubject = asyncHandler(async (req, res, next) => {
  const { subjectId } = req.body;
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if already enrolled
  if (user.enrolledSubjects.includes(subjectId)) {
    return next(new AppError("User is already enrolled in this subject", 400));
  }

  user.enrolledSubjects.push(subjectId);
  await user.save();

  await user.populate("enrolledSubjects", "name description");

  res.status(200).json({
    success: true,
    message: "User enrolled successfully",
    enrolledSubjects: user.enrolledSubjects,
  });
});

/**
 * @desc    Unenroll user from a subject
 * @route   DELETE /api/v1/users/:id/enroll/:subjectId
 * @access  Private/Admin/Teacher
 */
const unenrollFromSubject = asyncHandler(async (req, res, next) => {
  const { id, subjectId } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if enrolled
  const index = user.enrolledSubjects.indexOf(subjectId);
  if (index === -1) {
    return next(new AppError("User is not enrolled in this subject", 400));
  }

  user.enrolledSubjects.splice(index, 1);
  await user.save();

  await user.populate("enrolledSubjects", "name description");

  res.status(200).json({
    success: true,
    message: "User unenrolled successfully",
    enrolledSubjects: user.enrolledSubjects,
  });
});

/**
 * @desc    Get users by role
 * @route   GET /api/v1/users/role/:role
 * @access  Private/Admin
 */
const getUsersByRole = asyncHandler(async (req, res, next) => {
  const { role } = req.params;

  if (!["student", "teacher", "admin"].includes(role)) {
    return next(new AppError("Invalid role", 400));
  }

  const users = await User.find({ role, isActive: true })
    .select("name email avatar createdAt")
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  enrollInSubject,
  unenrollFromSubject,
  getUsersByRole,
};
