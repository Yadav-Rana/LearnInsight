const multer = require("multer");
const { AppError } = require("./errorHandler");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
]);

const ALLOWED_EXTENSIONS = /\.(pdf|docx|txt|md)$/i;

// Vercel functions reject request bodies over 4.5 MB, so stay safely below that.
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.test(file.originalname || "");
  if (mimeOk || extOk) {
    cb(null, true);
  } else {
    cb(new AppError("Unsupported file format. Upload a PDF, DOCX, or TXT file.", 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

/**
 * Wraps `upload.single(fieldName)` to translate multer errors into AppError
 * with appropriate status codes.
 */
const singleDocument = (fieldName = "file") => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("File is too large (max 4 MB).", 413));
      }
      return next(new AppError(err.message, 400));
    }
    return next(err);
  });
};

module.exports = { singleDocument, MAX_FILE_SIZE };
