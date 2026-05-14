const asyncHandler = require("express-async-handler");
const { AppError } = require("../middleware");
const youtubeService = require("../services/youtube.service");

/**
 * @desc    Search YouTube for videos
 * @route   GET /api/v1/youtube/search?q=...&maxResults=5
 * @access  Private (teacher/admin)
 */
const searchYouTube = asyncHandler(async (req, res, next) => {
  const { q, maxResults } = req.query;

  if (!q || !q.trim()) {
    return next(new AppError("Query parameter 'q' is required", 400));
  }

  const limit = Math.min(parseInt(maxResults) || 5, 25);
  const videos = await youtubeService.searchVideos({ query: q.trim(), maxResults: limit });

  res.status(200).json({
    success: true,
    count: videos.length,
    data: videos,
  });
});

module.exports = { searchYouTube };
