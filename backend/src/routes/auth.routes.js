const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware");
const validate = require("../middleware/validate");

const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/auth.validator");

// Public routes
router.post("/register", validate(registerValidator), register);
router.post("/login", validate(loginValidator), login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, validate(updateProfileValidator), updateProfile);
router.put("/change-password", protect, validate(changePasswordValidator), changePassword);

module.exports = router;
