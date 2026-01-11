"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

interface Quiz {
  _id: string;
  title: string;
  description: string;
  subject: { _id: string; name: string };
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number | null;
  questions: Array<{ question: string }>;
  isPublished: boolean;
  isAIGenerated: boolean;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

export default function QuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("");

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/quizzes");
      setQuizzes(response.data.data || []);
    } catch (err) {
      setError("Failed to load quizzes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      fetchQuizzes();
    } catch (err) {
      alert("Failed to delete quiz");
    }
  };

  const handleTogglePublish = async (quizId: string) => {
    try {
      await api.put(`/quizzes/${quizId}/publish`);
      fetchQuizzes();
    } catch (err) {
      alert("Failed to update quiz");
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !filterDifficulty || quiz.difficulty === filterDifficulty;
    const isVisible = isTeacherOrAdmin || quiz.isPublished;
    return matchesSearch && matchesDifficulty && isVisible;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-2"
          style={{ borderColor: "rgba(249, 115, 22, 0.3)", borderTopColor: "#F97316" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-hk-grotesk)", color: "var(--text-primary)" }}>
            Quizzes
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
            {isTeacherOrAdmin ? "Create and manage quizzes" : "Test your knowledge"}
          </p>
        </div>
        {isTeacherOrAdmin && (
          <Link
            href="/quizzes/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "white", fontFamily: "var(--font-body)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Quiz
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255, 255, 255, 0.4)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 focus:outline-none"
            style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
          />
        </div>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none"
          style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444" }}>
          {error}
        </div>
      )}

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <div className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-hk-grotesk)", color: "var(--text-primary)" }}>No quizzes found</h3>
          <p className="mt-2" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
            {isTeacherOrAdmin ? "Create your first quiz to get started." : "No quizzes available yet. Check back later!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} isTeacherOrAdmin={isTeacherOrAdmin} onDelete={() => handleDelete(quiz._id)} onTogglePublish={() => handleTogglePublish(quiz._id)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface QuizCardProps {
  quiz: Quiz;
  isTeacherOrAdmin: boolean;
  onDelete: () => void;
  onTogglePublish: () => void;
}

function QuizCard({ quiz, isTeacherOrAdmin, onDelete, onTogglePublish }: QuizCardProps) {
  const difficultyStyles = {
    easy: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)", color: "#22C55E" },
    medium: { bg: "rgba(234, 179, 8, 0.15)", border: "rgba(234, 179, 8, 0.3)", color: "#EAB308" },
    hard: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", color: "#EF4444" },
  };
  const difficulty = difficultyStyles[quiz.difficulty];

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200 hover:translate-y-[-2px]" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: difficulty.bg, border: `1px solid ${difficulty.border}`, color: difficulty.color }}>
              {quiz.difficulty}
            </span>
            {quiz.isAIGenerated && (
              <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)", color: "#A855F7" }}>
                AI Generated
              </span>
            )}
            {isTeacherOrAdmin && !quiz.isPublished && (
              <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-muted)" }}>
                Draft
              </span>
            )}
          </div>
          {isTeacherOrAdmin && (
            <div className="flex gap-1">
              <button onClick={onTogglePublish} className="p-2 rounded-lg transition-colors" style={{ color: quiz.isPublished ? "#22C55E" : "rgba(255, 255, 255, 0.4)" }} title={quiz.isPublished ? "Unpublish" : "Publish"}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <Link href={`/quizzes/${quiz._id}/edit`} className="p-2 rounded-lg transition-colors" style={{ color: "rgba(255, 255, 255, 0.4)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              <button onClick={onDelete} className="p-2 rounded-lg transition-colors" style={{ color: "rgba(255, 255, 255, 0.4)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <h3 className="mt-4 text-lg font-semibold" style={{ fontFamily: "var(--font-hk-grotesk)", color: "var(--text-primary)" }}>{quiz.title}</h3>
        <p className="mt-1 text-sm line-clamp-2" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>{quiz.description || "No description available"}</p>

        <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {quiz.subject?.name || "No subject"}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {quiz.questions?.length || 0} questions
          </span>
          {quiz.timeLimit && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {quiz.timeLimit} min
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-3" style={{ background: "rgba(255, 255, 255, 0.02)", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
        <Link href={`/quizzes/${quiz._id}`} className="text-sm font-medium" style={{ color: "#F97316" }}>
          {isTeacherOrAdmin ? "View Details →" : "Start Quiz →"}
        </Link>
      </div>
    </div>
  );
}
