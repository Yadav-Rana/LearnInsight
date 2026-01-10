const asyncHandler = require("express-async-handler");
const { User } = require("../models");
const { AppError } = require("../middleware");
const { sendTokenResponse } = require("../utils/generateToken");
const config = require("../config");

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || "student",
  });

  // Send token response
  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated", 401));
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Send token response
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate(
    "enrolledSubjects",
    "name description"
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      enrolledSubjects: user.enrolledSubjects,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/update-profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, avatar } = req.body;

  // Build update object
  const updateFields = {};
  if (name) updateFields.name = name;
  if (avatar !== undefined) updateFields.avatar = avatar;

  // If email is being changed, check if it's already taken
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email is already taken", 400));
    }
    updateFields.email = email;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: true,
    runValidators: true,
  }).populate("enrolledSubjects", "name description");

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      enrolledSubjects: user.enrolledSubjects,
    },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Send new token
  sendTokenResponse(user, 200, res);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
