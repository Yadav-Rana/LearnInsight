"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Loader } from "@/components/ui";
import { GlassCard } from "@/components/dashboard";

interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface QuizData {
  title: string;
  description: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number | null;
  passingScore: number;
  showAnswers: boolean;
  isPublished: boolean;
  questions: Question[];
}

interface Subject {
  _id: string;
  name: string;
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
};

const sectionMotion = (i: number) => ({
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay: i * 0.1 },
});

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quiz, setQuiz] = useState<QuizData>({
    title: "",
    description: "",
    subject: "",
    difficulty: "medium",
    timeLimit: null,
    passingScore: 60,
    showAnswers: true,
    isPublished: false,
    questions: [],
  });

  useEffect(() => {
    Promise.all([
      api.get(`/quizzes/${params.id}`),
      api.get("/subjects"),
    ]).then(([quizRes, subjectsRes]) => {
      const q = quizRes.data.data;
      setQuiz({
        title: q.title,
        description: q.description || "",
        subject: typeof q.subject === "object" ? q.subject._id : q.subject,
        difficulty: q.difficulty,
        timeLimit: q.timeLimit,
        passingScore: q.passingScore || 60,
        showAnswers: q.showAnswers !== false,
        isPublished: q.isPublished,
        questions: q.questions.map((qu: Question) => ({
          _id: qu._id,
          question: qu.question,
          options: [...qu.options],
          correctAnswer: qu.correctAnswer,
          explanation: qu.explanation || "",
          points: qu.points || 1,
        })),
      });
      setSubjects(subjectsRes.data.data || subjectsRes.data.subjects || []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load quiz");
      setLoading(false);
    });
  }, [params.id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await api.put(`/quizzes/${params.id}`, quiz);
      router.push(`/quizzes/${params.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (idx: number, field: keyof Question, value: unknown) => {
    const updated = [...quiz.questions];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[idx] as any)[field] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...quiz.questions];
    updated[qIdx].options[oIdx] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "", points: 1 },
      ],
    });
  };

  const removeQuestion = (idx: number) => {
    if (quiz.questions.length <= 1) return;
    setQuiz({ ...quiz, questions: quiz.questions.filter((_, i) => i !== idx) });
  };

  const addOption = (qIdx: number) => {
    if (quiz.questions[qIdx].options.length >= 6) return;
    const updated = [...quiz.questions];
    updated[qIdx].options.push("");
    setQuiz({ ...quiz, questions: updated });
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    if (quiz.questions[qIdx].options.length <= 2) return;
    const updated = [...quiz.questions];
    updated[qIdx].options.splice(oIdx, 1);
    if (updated[qIdx].correctAnswer >= updated[qIdx].options.length) {
      updated[qIdx].correctAnswer = 0;
    }
    setQuiz({ ...quiz, questions: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div {...sectionMotion(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Edit Quiz
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
            Update quiz details and questions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "white", fontFamily: "var(--font-body)" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444" }}>
          {error}
        </div>
      )}

      {/* Quiz Details */}
      <motion.div {...sectionMotion(1)}>
        <GlassCard>
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Quiz Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Title *</label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
              <textarea
                value={quiz.description}
                onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 resize-none"
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Subject</label>
                <select
                  value={quiz.subject}
                  onChange={(e) => setQuiz({ ...quiz, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  style={inputStyle}
                >
                  <option value="" style={{ background: "#1a1a2e" }}>Select</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id} style={{ background: "#1a1a2e" }}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Difficulty</label>
                <select
                  value={quiz.difficulty}
                  onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value as "easy" | "medium" | "hard" })}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  style={inputStyle}
                >
                  <option value="easy" style={{ background: "#1a1a2e" }}>Easy</option>
                  <option value="medium" style={{ background: "#1a1a2e" }}>Medium</option>
                  <option value="hard" style={{ background: "#1a1a2e" }}>Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Time Limit (min)</label>
                <input
                  type="number"
                  value={quiz.timeLimit || ""}
                  onChange={(e) => setQuiz({ ...quiz, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="No limit"
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Passing %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={quiz.passingScore}
                  onChange={(e) => setQuiz({ ...quiz, passingScore: parseInt(e.target.value) || 60 })}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quiz.showAnswers}
                  onChange={(e) => setQuiz({ ...quiz, showAnswers: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
                  Show answers after submission
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quiz.isPublished}
                  onChange={(e) => setQuiz({ ...quiz, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
                  Published
                </span>
              </label>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Questions */}
      {quiz.questions.map((q, qIdx) => (
        <motion.div key={qIdx} {...sectionMotion(qIdx + 2)}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Question {qIdx + 1}
              </h3>
              <button
                onClick={() => removeQuestion(qIdx)}
                disabled={quiz.questions.length <= 1}
                className="p-2 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-30"
                style={{ color: "rgba(255, 255, 255, 0.4)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Question Text *</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  style={inputStyle}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Options *</label>
                  <button
                    onClick={() => addOption(qIdx)}
                    disabled={q.options.length >= 6}
                    className="text-xs font-medium disabled:opacity-30"
                    style={{ color: "#F97316" }}
                  >
                    + Add Option
                  </button>
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuestion(qIdx, "correctAnswer", oIdx)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200"
                        style={{
                          background: q.correctAnswer === oIdx ? "linear-gradient(135deg, #22C55E, #16A34A)" : "rgba(255, 255, 255, 0.06)",
                          color: q.correctAnswer === oIdx ? "white" : "var(--text-muted)",
                          border: q.correctAnswer === oIdx ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                        title={q.correctAnswer === oIdx ? "Correct answer" : "Mark as correct"}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        className="flex-1 px-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                        style={inputStyle}
                      />
                      {q.options.length > 2 && (
                        <button
                          onClick={() => removeOption(qIdx, oIdx)}
                          className="p-1.5 rounded-lg hover:bg-white/5"
                          style={{ color: "rgba(255, 255, 255, 0.3)" }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  Click the letter to mark the correct answer (green = correct)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Explanation</label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)}
                  placeholder="Optional explanation shown after answering"
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  style={inputStyle}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}

      {/* Add Question */}
      <motion.div {...sectionMotion(quiz.questions.length + 2)}>
        <button
          onClick={addQuestion}
          className="w-full p-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px dashed rgba(255, 255, 255, 0.15)",
            color: "#F97316",
            fontFamily: "var(--font-body)",
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Question
        </button>
      </motion.div>

      {/* Bottom Save */}
      <motion.div {...sectionMotion(quiz.questions.length + 3)} className="flex justify-end gap-2 pb-8">
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "white", fontFamily: "var(--font-body)" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>
    </div>
  );
}
