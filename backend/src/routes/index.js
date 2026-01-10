const express = require("express");
const router = express.Router();

// Import route files
// const authRoutes = require("./auth.routes");
// const userRoutes = require("./user.routes");

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
// router.use("/auth", authRoutes);
// router.use("/users", userRoutes);

module.exports = router;
