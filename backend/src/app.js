const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const config = require("./config");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middleware");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Logging middleware (only in development)
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// API routes
app.use("/api/v1", routes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LearnInsight API",
    version: "1.0.0",
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
