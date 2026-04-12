"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Loader } from "@/components/ui";
import { GlassCard } from "@/components/dashboard";

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  subject: { _id: string; name: string };
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number | null;
  passingScore: number;
  questions: Question[];
  isPublished: boolean;
  createdBy: { _id: string; name: string };
}

const difficultyStyles = {
  easy: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)", color: "#22C55E" },
  medium: { bg: "rgba(234, 179, 8, 0.15)", border: "rgba(234, 179, 8, 0.3)", color: "#EAB308" },
  hard: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", color: "#EF4444" },
};

const sectionMotion = (i: number) => ({
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay: i * 0.1 },
});

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quiz taking state
  const [isTaking, setIsTaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    percentage: number;
    timeTaken: number;
    passed: boolean;
  } | null>(null);

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    if (params.id) fetchQuiz();
  }, [params.id]);

  useEffect(() => {
    if (!isTaking || timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTaking, timeLeft]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/${params.id}`);
      setQuiz(response.data.data);
    } catch {
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (!quiz) return;
    setIsTaking(true);
    setCurrentQuestion(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setStartedAt(new Date().toISOString());
    if (quiz.timeLimit) setTimeLeft(quiz.timeLimit * 60);
    setResult(null);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = useCallback(async () => {
    if (!quiz || submitting) return;
    try {
      setSubmitting(true);
      const mappedAnswers = quiz.questions.map((q, i) => ({
        questionId: q._id,
        selectedAnswer: answers[i] ?? -1,
      }));
      const response = await api.post("/attempts", {
        quizId: quiz._id,
        answers: mappedAnswers,
        startedAt,
      });
      setResult({
        score: response.data.data.score,
        percentage: response.data.data.percentage,
        timeTaken: response.data.data.timeTaken,
        passed: response.data.data.passed,
      });
      setIsTaking(false);
    } catch {
      alert("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }, [quiz, answers, startedAt, submitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "#EF4444" }}>{error || "Quiz not found"}</p>
        <button
          onClick={() => router.push("/quizzes")}
          className="mt-4 text-sm font-medium"
          style={{ color: "#F97316" }}
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const difficulty = difficultyStyles[quiz.difficulty];

  // ─── Result View ───
  if (result) {
    const scoreColor = result.percentage >= 70 ? "#22C55E" : result.percentage >= 40 ? "#EAB308" : "#EF4444";

    return (
      <div className="max-w-2xl mx-auto">
        <motion.div {...sectionMotion(0)}>
          <GlassCard className="text-center">
            {/* Score Circle */}
            <div
              className="w-28 h-28 mx-auto rounded-full flex items-center justify-center"
              style={{ background: `${scoreColor}15`, border: `3px solid ${scoreColor}` }}
            >
              <span className="text-3xl font-bold" style={{ color: scoreColor, fontFamily: "var(--font-display)" }}>
                {result.percentage}%
              </span>
            </div>

            <h1
              className="mt-6 text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              {result.passed ? "Congratulations!" : result.percentage >= 40 ? "Good Effort!" : "Keep Practicing!"}
            </h1>
            <p className="mt-2" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
              You completed: {quiz.title}
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Score", value: `${result.score}/${quiz.questions.length}` },
                { label: "Percentage", value: `${result.percentage}%` },
                { label: "Time Taken", value: formatTime(result.timeTaken) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl"
                  style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold mt-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Pass/Fail badge */}
            <div className="mt-6">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: result.passed ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  border: `1px solid ${result.passed ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                  color: result.passed ? "#22C55E" : "#EF4444",
                }}
              >
                {result.passed ? "PASSED" : "FAILED"}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={startQuiz}
                className="px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Retry Quiz
              </button>
              <Link
                href="/quizzes"
                className="px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                  color: "white",
                  fontFamily: "var(--font-body)",
                }}
              >
                Back to Quizzes
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // ─── Quiz Taking View ───
  if (isTaking) {
    const question = quiz.questions[currentQuestion];
    const answeredCount = answers.filter((a) => a !== null).length;
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div {...sectionMotion(0)}>
          <GlassCard padding="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                  {quiz.title}
                </h1>
                <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
              </div>
              {timeLeft !== null && (
                <div
                  className="px-4 py-2 rounded-xl font-mono font-bold"
                  style={{
                    background: timeLeft < 60 ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${timeLeft < 60 ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                    color: timeLeft < 60 ? "#EF4444" : "var(--text-primary)",
                  }}
                >
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>

            {/* Orange progress bar */}
            <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #F97316, #EA580C)" }}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Question */}
        <motion.div {...sectionMotion(1)}>
          <GlassCard>
            <h2
              className="text-lg font-medium mb-6"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = answers[currentQuestion] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className="w-full p-4 text-left rounded-xl transition-all duration-200"
                    style={{
                      background: isSelected ? "rgba(249, 115, 22, 0.1)" : "rgba(255, 255, 255, 0.03)",
                      border: isSelected
                        ? "1px solid rgba(249, 115, 22, 0.5)"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                        style={{
                          background: isSelected
                            ? "linear-gradient(135deg, #F97316, #EA580C)"
                            : "rgba(255, 255, 255, 0.08)",
                          color: isSelected ? "white" : "var(--text-muted)",
                        }}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
                        {option}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Navigation */}
        <motion.div {...sectionMotion(2)} className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Previous
          </button>

          <span className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
            {answeredCount} of {quiz.questions.length} answered
          </span>

          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                color: "white",
                fontFamily: "var(--font-body)",
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                color: "white",
                fontFamily: "var(--font-body)",
              }}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </motion.div>

        {/* Question Navigator */}
        <motion.div {...sectionMotion(3)}>
          <GlassCard padding="p-4">
            <p className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
              Question Navigator
            </p>
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((_, index) => {
                const isCurrent = currentQuestion === index;
                const isAnswered = answers[index] !== null;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className="w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      background: isCurrent
                        ? "linear-gradient(135deg, #F97316, #EA580C)"
                        : isAnswered
                        ? "rgba(34, 197, 94, 0.15)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: isCurrent
                        ? "none"
                        : isAnswered
                        ? "1px solid rgba(34, 197, 94, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      color: isCurrent ? "white" : isAnswered ? "#22C55E" : "var(--text-muted)",
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // ─── Quiz Overview (before starting) ───
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <motion.nav {...sectionMotion(0)} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
        <Link href="/quizzes" className="transition-colors hover:text-orange-400" style={{ fontFamily: "var(--font-body)" }}>
          Quizzes
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{quiz.title}</span>
      </motion.nav>

      {/* Quiz Info Card */}
      <motion.div {...sectionMotion(1)}>
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide"
                  style={{ background: difficulty.bg, border: `1px solid ${difficulty.border}`, color: difficulty.color }}
                >
                  {quiz.difficulty}
                </span>
                {quiz.subject?.name && (
                  <span
                    className="px-2.5 py-1 text-xs font-medium rounded-full"
                    style={{ background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.25)", color: "#3B82F6" }}
                  >
                    {quiz.subject.name}
                  </span>
                )}
                {!quiz.isPublished && isTeacherOrAdmin && (
                  <span
                    className="px-2.5 py-1 text-xs font-medium rounded-full"
                    style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-muted)" }}
                  >
                    Draft
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                {quiz.title}
              </h1>
              <p className="mt-2" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                {quiz.description || "No description available"}
              </p>
            </div>
            {isTeacherOrAdmin && (
              <Link
                href={`/quizzes/${quiz._id}/edit`}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Edit Quiz
              </Link>
            )}
          </div>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Questions", value: quiz.questions?.length || 0, icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Time Limit", value: quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Passing", value: `${quiz.passingScore || 60}%`, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Created by", value: quiz.createdBy?.name || "Unknown", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl"
                style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-muted)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                  <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                    {stat.label}
                  </p>
                </div>
                <p className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Start Quiz Button */}
          {(quiz.isPublished || isTeacherOrAdmin) && quiz.questions?.length > 0 && (
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <button
                onClick={startQuiz}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                  color: "white",
                  fontFamily: "var(--font-body)",
                }}
              >
                {isTeacherOrAdmin ? "Preview Quiz" : "Start Quiz"}
              </button>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                {quiz.timeLimit
                  ? `You will have ${quiz.timeLimit} minutes to complete this quiz.`
                  : "Take your time, there is no time limit."}
              </p>
            </div>
          )}

          {quiz.questions?.length === 0 && (
            <div
              className="mt-6 p-4 rounded-xl"
              style={{
                background: "rgba(234, 179, 8, 0.1)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                color: "#EAB308",
                fontFamily: "var(--font-body)",
              }}
            >
              This quiz has no questions yet.
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
