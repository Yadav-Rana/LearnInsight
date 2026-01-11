const express = require("express");
const router = express.Router();

const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addResource,
  removeResource,
  getSubjectHierarchy,
} = require("../controllers/subject.controller");

const { protect, authorize } = require("../middleware");
const validate = require("../middleware/validate");

const {
  createSubjectValidator,
  updateSubjectValidator,
  subjectIdValidator,
  addResourceValidator,
} = require("../validators/subject.validator");

// All routes require authentication
router.use(protect);

router
  .route("/")
  .get(getSubjects)
  .post(
    authorize("admin", "teacher"),
    validate(createSubjectValidator),
    createSubject
  );

router
  .route("/:id")
  .get(validate(subjectIdValidator), getSubject)
  .put(
    authorize("admin", "teacher"),
    validate([...subjectIdValidator, ...updateSubjectValidator]),
    updateSubject
  )
  .delete(authorize("admin"), validate(subjectIdValidator), deleteSubject);

// Hierarchy route
router.get(
  "/:id/hierarchy",
  validate(subjectIdValidator),
  getSubjectHierarchy
);

// Resource routes
router
  .route("/:id/resources")
  .post(
    authorize("admin", "teacher"),
    validate([...subjectIdValidator, ...addResourceValidator]),
    addResource
  );

router.delete(
  "/:id/resources/:resourceId",
  authorize("admin", "teacher"),
  validate(subjectIdValidator),
  removeResource
);

module.exports = router;
