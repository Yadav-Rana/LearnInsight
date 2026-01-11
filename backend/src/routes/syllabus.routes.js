const express = require("express");
const router = express.Router();

const {
  createSyllabus,
  getMySyllabuses,
  getSyllabus,
  updateSyllabus,
  deleteSyllabus,
  generateQuizFromSyllabus,
  extractTopics,
} = require("../controllers/syllabus.controller");

const { protect } = require("../middleware");
const validate = require("../middleware/validate");

const {
  createSyllabusValidator,
  updateSyllabusValidator,
  syllabusIdValidator,
} = require("../validators/syllabus.validator");

// All routes require authentication
router.use(protect);

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
