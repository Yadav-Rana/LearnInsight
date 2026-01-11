const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  enrollInSubject,
  unenrollFromSubject,
  getUsersByRole,
} = require("../controllers/user.controller");

const { protect, authorize } = require("../middleware");
const validate = require("../middleware/validate");

const {
  updateUserValidator,
  userIdValidator,
  enrollSubjectValidator,
} = require("../validators/user.validator");

// All routes require authentication
router.use(protect);

// Admin only routes
router.get("/", authorize("admin"), getUsers);
router.get("/role/:role", authorize("admin"), getUsersByRole);

router
  .route("/:id")
  .get(authorize("admin", "teacher"), validate(userIdValidator), getUser)
  .put(authorize("admin"), validate([...userIdValidator, ...updateUserValidator]), updateUser)
  .delete(authorize("admin"), validate(userIdValidator), deleteUser);

// Enrollment routes (Admin and Teacher)
router.post(
  "/:id/enroll",
  authorize("admin", "teacher"),
  validate([...userIdValidator, ...enrollSubjectValidator]),
  enrollInSubject
);

router.delete(
  "/:id/enroll/:subjectId",
  authorize("admin", "teacher"),
  validate(userIdValidator),
  unenrollFromSubject
);

module.exports = router;
