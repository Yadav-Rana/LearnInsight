const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const config = require("../config");
const { AppError } = require("./errorHandler");
const { User } = require("../models");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first, then Authorization header
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch full user from DB so role and other fields are available
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401));
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
