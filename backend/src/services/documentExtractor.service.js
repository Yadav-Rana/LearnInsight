const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const MAX_TEXT_LENGTH = 200_000; // ~200k chars — plenty for syllabus content

/**
 * Best-effort fileType detection based on the original filename and mimetype
 * Returns one of: "pdf" | "docx" | "text"
 */
function detectFileType(originalName = "", mimetype = "") {
  const lower = originalName.toLowerCase();
  if (lower.endsWith(".pdf") || mimetype === "application/pdf") return "pdf";
  if (
    lower.endsWith(".docx") ||
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  if (
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    mimetype.startsWith("text/")
  ) {
    return "text";
  }
  return null;
}

async function extractFromPdf(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    if (typeof parser.destroy === "function") {
      await parser.destroy().catch(() => {});
    }
  }
}

async function extractFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

function extractFromText(buffer) {
  // Strip a UTF-8 BOM if present
  const str = buffer.toString("utf8");
  return str.charCodeAt(0) === 0xfeff ? str.slice(1) : str;
}

/**
 * Extract plain text from a document buffer.
 * Throws when the file type is unsupported or extraction fails.
 *
 * @param {Buffer} buffer
 * @param {{ originalName?: string, mimetype?: string }} meta
 * @returns {Promise<{ text: string, fileType: "pdf" | "docx" | "text" }>}
 */
async function extractText(buffer, meta = {}) {
  const fileType = detectFileType(meta.originalName, meta.mimetype);
  if (!fileType) {
    throw new Error(
      "Unsupported file format. Upload a PDF, DOCX, or TXT file."
    );
  }

  let text;
  if (fileType === "pdf") {
    text = await extractFromPdf(buffer);
  } else if (fileType === "docx") {
    text = await extractFromDocx(buffer);
  } else {
    text = extractFromText(buffer);
  }

  // Normalise whitespace: collapse runs of blank lines and trim trailing spaces.
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) {
    throw new Error(
      "Could not extract any text from the file. If it is a scanned PDF, OCR is not supported."
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH);
  }

  return { text, fileType };
}

module.exports = { extractText, detectFileType, MAX_TEXT_LENGTH };
