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
