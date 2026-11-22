const { GoogleGenAI, Type } = require("@google/genai");
const config = require("../config");

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

// Overridable via env so a model retirement doesn't require a code change.
// "-latest" aliases track Google's current models (pinned names like gemini-2.5-pro
// get retired for new keys). Pro has no free-tier quota, so the summary defaults to
// flash; with billing enabled set GEMINI_MODEL_PRO=gemini-pro-latest.
const MODEL_FLASH = process.env.GEMINI_MODEL_FLASH || "gemini-flash-latest";
const MODEL_PRO = process.env.GEMINI_MODEL_PRO || MODEL_FLASH;

// Last resort: separate per-model quota on the free tier, so it often still works
// after flash hits its daily limit.
const MODEL_LITE = process.env.GEMINI_MODEL_LITE || "gemini-flash-lite-latest";
// Pinned older flash — its own quota bucket, so it's a useful middle fallback.
const MODEL_FLASH_PINNED = "gemini-2.5-flash";

const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 20000;

// Retired model (404), quota exhausted (429) or overloaded (503) → try the next model.
const isRetryable = (err) =>
  /NOT_FOUND|no longer available|is not found|not supported|RESOURCE_EXHAUSTED|quota|UNAVAILABLE|high demand|timed? ?out|abort|"code":(404|429|500|503)/i.test(
    err?.message || ""
  );

async function callGemini({ model, prompt, responseSchema }) {
  const chain = [...new Set([model, MODEL_FLASH, MODEL_FLASH_PINNED, MODEL_LITE])];
  let lastErr;
  for (const m of chain) {
    try {
      const response = await ai.models.generateContent({
        model: m,
        contents: prompt,
        config: {
          // Overloaded models can hang for a long time — give up and fall back quickly.
          httpOptions: { timeout: TIMEOUT_MS },
          ...(responseSchema ? { responseMimeType: "application/json", responseSchema } : {}),
        },
      });
      return response.text;
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err)) throw err;
      console.warn(`Gemini model "${m}" failed (${String(err.message).slice(0, 80)}…), trying next model`);
    }
  }
  throw lastErr;
}

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
        },
        required: ["question", "options", "correctAnswer", "explanation"],
      },
    },
  },
  required: ["questions"],
};

async function generateQuiz({ content, count = 5, difficulty = "medium" }) {
  const prompt = `You are a quiz writer. Read the syllabus below and create exactly ${count} multiple-choice questions of ${difficulty} difficulty.

Rules:
- Each question must have exactly 4 options.
- correctAnswer is the 0-based index of the correct option.
- Provide a brief explanation (1-2 sentences) for why the correct answer is right.
- Questions must be factual and directly grounded in the syllabus content.
- Avoid trick questions or ambiguous wording.

SYLLABUS:
${content}`;

  const raw = await callGemini({ model: MODEL_FLASH, prompt, responseSchema: quizSchema });
  const parsed = JSON.parse(raw);
  return parsed.questions.map((q) => ({
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    points: 1,
  }));
}

const topicsSchema = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["topic", "subtopics"],
      },
    },
  },
  required: ["topics"],
};

async function extractTopics({ content }) {
  const prompt = `Extract the main topics from the syllabus below. For each topic, list 2-5 subtopics that fall under it. Return between 4 and 10 topics total.

SYLLABUS:
${content}`;

  const raw = await callGemini({ model: MODEL_FLASH, prompt, responseSchema: topicsSchema });
  return JSON.parse(raw).topics;
}

async function generateInsightSummary({ overallStats, weakAreas, strengths }) {
  const weakText = weakAreas.length
    ? weakAreas.map((w) => `- ${w.subjectName}: avg ${w.averageScore}% (${w.severity})`).join("\n")
    : "- none identified";
  const strongText = strengths.length
    ? strengths.map((s) => `- ${s.subjectName}: avg ${s.averageScore}%`).join("\n")
    : "- none yet";

  const prompt = `You are a personal learning coach. Write a concise, encouraging 3-4 sentence summary of this student's progress. Be direct: name the specific weak areas and what to focus on next. Avoid generic platitudes.

STATS:
- Subjects studied: ${overallStats.totalSubjects}
- Avg completion: ${overallStats.averageCompletionRate}%
- Avg quiz score: ${overallStats.averageQuizScore}%
- Time spent: ${Math.round(overallStats.totalTimeSpent / 3600)} hours

WEAK AREAS:
${weakText}

STRENGTHS:
${strongText}

Return only the summary text, no markdown or labels.`;

  return (await callGemini({ model: MODEL_PRO, prompt })).trim();
}

const recommendationsSchema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          searchQuery: { type: Type.STRING },
          topicName: { type: Type.STRING },
          description: { type: Type.STRING },
          relevance: { type: Type.NUMBER },
        },
        required: ["title", "searchQuery", "topicName", "description", "relevance"],
      },
    },
  },
  required: ["recommendations"],
};

async function generateRecommendations({ weakAreas }) {
  if (weakAreas.length === 0) return [];

  const weakText = weakAreas
    .map((w) => `- ${w.subjectName}: avg ${w.averageScore}%, reason: ${w.reason}`)
    .join("\n");

  const prompt = `Suggest 3-5 study recommendations for a student with these weak areas. For each recommendation, provide a YouTube search query that would find a high-quality tutorial.

WEAK AREAS:
${weakText}

For each recommendation:
- title: short title (e.g., "Master Binary Search Trees")
- searchQuery: the YouTube search query (e.g., "binary search tree tutorial explained")
- topicName: which weak-area subject this targets
- description: 1 sentence on why this helps
- relevance: 0-100 score`;

  const raw = await callGemini({ model: MODEL_FLASH, prompt, responseSchema: recommendationsSchema });
  return JSON.parse(raw).recommendations;
}

module.exports = {
  generateQuiz,
  extractTopics,
  generateInsightSummary,
  generateRecommendations,
};
