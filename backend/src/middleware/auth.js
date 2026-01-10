const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const config = require("../config");
const { AppError } = require("./errorHandler");

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

    // Add user info to request
    // You'll need to import your User model and find the user
    // req.user = await User.findById(decoded.id).select("-password");
    req.user = decoded;

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
