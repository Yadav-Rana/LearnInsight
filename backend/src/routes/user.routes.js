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
  getMyInviteCode,
  regenerateInviteCode,
  joinTeacher,
  leaveTeacher,
  removeStudent,
} = require("../controllers/user.controller");

const { protect, authorize } = require("../middleware");
const validate = require("../middleware/validate");

const {
  updateUserValidator,
  userIdValidator,
  enrollSubjectValidator,
  joinTeacherValidator,
} = require("../validators/user.validator");

// All routes require authentication
router.use(protect);

// Tenancy: invite-code + join/leave (must come before /:id catch-alls)
router.get("/me/invite-code", authorize("teacher", "admin"), getMyInviteCode);
router.post(
  "/me/regenerate-invite-code",
  authorize("teacher", "admin"),
  regenerateInviteCode
);
router.post(
  "/join-teacher",
  authorize("student"),
  validate(joinTeacherValidator),
  joinTeacher
);
router.delete("/me/teacher", authorize("student"), leaveTeacher);

// Listing routes
router.get("/", authorize("admin", "teacher"), getUsers);
router.get("/role/:role", authorize("admin", "teacher"), getUsersByRole);

// Teacher removes a student from their roster
router.post(
  "/:id/remove-student",
  authorize("admin", "teacher"),
  validate(userIdValidator),
  removeStudent
);

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
