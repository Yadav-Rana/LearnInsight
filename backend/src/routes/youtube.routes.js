const express = require("express");
const router = express.Router();

const { searchYouTube } = require("../controllers/youtube.controller");
const { protect, authorize } = require("../middleware");

router.use(protect);

router.get("/search", authorize("teacher", "admin"), searchYouTube);

module.exports = router;
