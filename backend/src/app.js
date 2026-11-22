const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const config = require("./config");
const connectDB = require("./config/database");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middleware");

const app = express();

// Start the DB connection here so the app works both under server.js and as
// a Vercel serverless entry (which imports this module and never calls listen).
// Mongoose buffers queries until the connection is ready.
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
// FRONTEND_URL may be a comma-separated list (e.g. production + preview domains)
const allowedOrigins = config.frontendUrl.split(",").map((o) => o.trim().replace(/\/$/, ""));
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Request logging — always enabled in dev/preview. Uses a plain format
// (no ANSI escapes) and writes to stderr so output isn't swallowed when
// the process is run under `concurrently` or other multiplexers.
if (config.nodeEnv !== "test") {
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms", {
      stream: { write: (msg) => process.stderr.write(msg) },
    })
  );
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
