const express = require("express");
const router = express.Router();

const {
  createSyllabus,
  uploadSyllabus,
  getMySyllabuses,
  getSyllabus,
  updateSyllabus,
  deleteSyllabus,
  generateQuizFromSyllabus,
  extractTopics,
} = require("../controllers/syllabus.controller");

const { protect } = require("../middleware");
const validate = require("../middleware/validate");
const { singleDocument } = require("../middleware/upload");

const {
  createSyllabusValidator,
  updateSyllabusValidator,
  syllabusIdValidator,
} = require("../validators/syllabus.validator");

// All routes require authentication
router.use(protect);

// Document upload (multipart). Must come before /:id so it doesn't get treated as an id.
router.post("/upload", singleDocument("file"), uploadSyllabus);

router
  .route("/")
  .get(getMySyllabuses)
  .post(validate(createSyllabusValidator), createSyllabus);

router
  .route("/:id")
  .get(validate(syllabusIdValidator), getSyllabus)
  .put(validate([...syllabusIdValidator, ...updateSyllabusValidator]), updateSyllabus)
  .delete(validate(syllabusIdValidator), deleteSyllabus);

// AI operations
router.post(
  "/:id/generate-quiz",
  validate(syllabusIdValidator),
  generateQuizFromSyllabus
);

router.post(
  "/:id/extract-topics",
  validate(syllabusIdValidator),
  extractTopics
);

module.exports = router;
