const asyncHandler = require("express-async-handler");
const { User } = require("../models");
const { AppError } = require("../middleware");
const { generateUniqueInviteCode } = require("../utils/inviteCode");

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

/**
 * @desc    Get my invite code (teacher only). Creates one if missing.
 * @route   GET /api/v1/users/me/invite-code
 * @access  Private/Teacher
 */
const getMyInviteCode = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return next(new AppError("Only teachers can have an invite code", 403));
  }

  if (!req.user.inviteCode) {
    req.user.inviteCode = await generateUniqueInviteCode(User);
    await req.user.save();
  }

  res.status(200).json({
    success: true,
    inviteCode: req.user.inviteCode,
  });
});

/**
 * @desc    Regenerate my invite code (teacher only). Invalidates old code.
 * @route   POST /api/v1/users/me/regenerate-invite-code
 * @access  Private/Teacher
 */
const regenerateInviteCode = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return next(new AppError("Only teachers can have an invite code", 403));
  }

  req.user.inviteCode = await generateUniqueInviteCode(User);
  await req.user.save();

  res.status(200).json({
    success: true,
    message: "Invite code regenerated",
    inviteCode: req.user.inviteCode,
  });
});

/**
 * @desc    Student submits an invite code to attach to a teacher.
 * @route   POST /api/v1/users/join-teacher
 * @access  Private/Student
 */
const joinTeacher = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "student") {
    return next(new AppError("Only students can join a teacher", 403));
  }

  const code = (req.body.code || "").trim().toUpperCase();
  if (!code) {
    return next(new AppError("Invite code is required", 400));
  }

  const teacher = await User.findOne({
    inviteCode: code,
    role: "teacher",
    isActive: true,
  }).select("_id name email");

  if (!teacher) {
    return next(new AppError("Invalid invite code", 404));
  }

  req.user.teacher = teacher._id;
  await req.user.save();

  res.status(200).json({
    success: true,
    message: `Joined ${teacher.name}'s classroom`,
    teacher: {
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
    },
  });
});

/**
 * @desc    Student leaves their current teacher.
 * @route   DELETE /api/v1/users/me/teacher
 * @access  Private/Student
 */
const leaveTeacher = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "student") {
    return next(new AppError("Only students can leave a teacher", 403));
  }

  if (!req.user.teacher) {
    return next(new AppError("You are not currently attached to a teacher", 400));
  }

  req.user.teacher = null;
  await req.user.save();

  res.status(200).json({
    success: true,
    message: "Left teacher's classroom",
  });
});

/**
 * @desc    Teacher removes a student from their roster.
 * @route   POST /api/v1/users/:id/remove-student
 * @access  Private/Teacher
 */
const removeStudent = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return next(new AppError("Not authorized", 403));
  }

  const student = await User.findById(req.params.id);
  if (!student) {
    return next(new AppError("Student not found", 404));
  }

  if (student.role !== "student") {
    return next(new AppError("Target user is not a student", 400));
  }

  // Teachers can only remove their own students; admins can remove any
  if (
    req.user.role === "teacher" &&
    (!student.teacher || student.teacher.toString() !== req.user.id)
  ) {
    return next(new AppError("Student is not in your classroom", 403));
  }

  student.teacher = null;
  await student.save();

  res.status(200).json({
    success: true,
    message: "Student removed from classroom",
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
  getMyInviteCode,
  regenerateInviteCode,
  joinTeacher,
  leaveTeacher,
  removeStudent,
};
