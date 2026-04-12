"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Loader } from "@/components/ui";
import { GlassCard } from "@/components/dashboard";

interface Resource {
  _id: string;
  title: string;
  url: string;
  type: "youtube" | "article" | "pdf";
}

interface Subject {
  _id: string;
  name: string;
  description: string;
  icon: string;
  parent: { _id: string; name: string } | null;
  level: number;
  createdBy: { _id: string; name: string };
  resources: Resource[];
  createdAt: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number | null;
  questionsCount: number;
  isPublished: boolean;
}

const sectionMotion = (i: number) => ({
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay: i * 0.1 },
});

const difficultyStyles: Record<string, { bg: string; border: string; color: string }> = {
  easy: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)", color: "#22C55E" },
  medium: { bg: "rgba(234, 179, 8, 0.15)", border: "rgba(234, 179, 8, 0.3)", color: "#EAB308" },
  hard: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", color: "#EF4444" },
};

const resourceTypeStyles: Record<string, { bg: string; border: string; color: string }> = {
  youtube: { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.25)", color: "#EF4444" },
  pdf: { bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.25)", color: "#F97316" },
  article: { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.25)", color: "#3B82F6" },
};

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [children, setChildren] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddResource, setShowAddResource] = useState(false);

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    if (params.id) {
      fetchSubject();
      fetchQuizzes();
    }
  }, [params.id]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const [subjectRes, hierarchyRes] = await Promise.all([
        api.get(`/subjects/${params.id}`),
        api.get(`/subjects/${params.id}/hierarchy`).catch(() => ({ data: { data: { children: [] } } })),
      ]);
      setSubject(subjectRes.data.data);
      setChildren(hierarchyRes.data.data?.children || []);
    } catch {
      setError("Failed to load subject");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await api.get(`/quizzes/subject/${params.id}`);
      setQuizzes(response.data.data || []);
    } catch {
      // silently fail
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Remove this resource?")) return;
    try {
      await api.delete(`/subjects/${params.id}/resources/${resourceId}`);
      fetchSubject();
    } catch {
      alert("Failed to remove resource");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "#EF4444" }}>{error || "Subject not found"}</p>
        <button onClick={() => router.push("/subjects")} className="mt-4 text-sm font-medium" style={{ color: "#F97316" }}>
          Back to Subjects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.nav {...sectionMotion(0)} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
        <Link href="/subjects" className="transition-colors hover:text-orange-400" style={{ fontFamily: "var(--font-body)" }}>
          Subjects
        </Link>
        <span>/</span>
        {subject.parent && (
          <>
            <Link href={`/subjects/${subject.parent._id}`} className="transition-colors hover:text-orange-400" style={{ fontFamily: "var(--font-body)" }}>
              {subject.parent.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: "var(--text-primary)" }}>{subject.name}</span>
      </motion.nav>

      {/* Header Card */}
      <motion.div {...sectionMotion(1)}>
        <GlassCard>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                {subject.name}
              </h1>
              <p className="mt-2" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                {subject.description || "No description available"}
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                <span>Created by {subject.createdBy?.name || "Unknown"}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span>{subject.resources?.length || 0} resources</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span>{quizzes.length} quizzes</span>
              </div>
            </div>
            {isTeacherOrAdmin && (
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/subjects/${subject._id}/edit`}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Edit
                </Link>
                <Link
                  href={`/quizzes/create?subject=${subject._id}`}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                    color: "white",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Create Quiz
                </Link>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Sub-subjects */}
      {children.length > 0 && (
        <motion.div {...sectionMotion(2)}>
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Sub-topics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <Link
                  key={child._id}
                  href={`/subjects/${child._id}`}
                  className="p-4 rounded-xl transition-all duration-200 hover:translate-y-[-1px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <h3 className="font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    {child.name}
                  </h3>
                  <p className="text-sm mt-1 line-clamp-2" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                    {child.description || "No description"}
                  </p>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Resources */}
      <motion.div {...sectionMotion(3)}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Resources
            </h2>
            {isTeacherOrAdmin && (
              <button
                onClick={() => setShowAddResource(true)}
                className="text-sm font-medium transition-colors"
                style={{ color: "#F97316", fontFamily: "var(--font-body)" }}
              >
                + Add Resource
              </button>
            )}
          </div>

          {subject.resources?.length === 0 ? (
            <p className="text-center py-8" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
              No resources added yet
            </p>
          ) : (
            <div className="space-y-3">
              {subject.resources?.map((resource) => {
                const typeStyle = resourceTypeStyles[resource.type] || resourceTypeStyles.article;
                return (
                  <div
                    key={resource._id}
                    className="flex items-center justify-between p-4 rounded-xl transition-all duration-200"
                    style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-xl"
                        style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}`, color: typeStyle.color }}
                      >
                        {getResourceIcon(resource.type)}
                      </div>
                      <div>
                        <h3 className="font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                          {resource.title}
                        </h3>
                        <p className="text-xs capitalize mt-0.5" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                          {resource.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg transition-colors hover:bg-white/5"
                        style={{ color: "#F97316" }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => handleDeleteResource(resource._id)}
                          className="p-2 rounded-lg transition-colors hover:bg-white/5"
                          style={{ color: "rgba(255, 255, 255, 0.4)" }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Quizzes */}
      <motion.div {...sectionMotion(4)}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Quizzes
            </h2>
            {isTeacherOrAdmin && (
              <Link
                href={`/quizzes/create?subject=${subject._id}`}
                className="text-sm font-medium transition-colors"
                style={{ color: "#F97316", fontFamily: "var(--font-body)" }}
              >
                + Create Quiz
              </Link>
            )}
          </div>

          {quizzes.length === 0 ? (
            <p className="text-center py-8" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
              No quizzes available yet
            </p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => {
                const diff = difficultyStyles[quiz.difficulty] || difficultyStyles.medium;
                return (
                  <div
                    key={quiz._id}
                    className="flex items-center justify-between p-4 rounded-xl transition-all duration-200"
                    style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                          {quiz.title}
                        </h3>
                        <span
                          className="px-2 py-0.5 text-xs font-semibold rounded-full"
                          style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color }}
                        >
                          {quiz.difficulty}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                        {quiz.questionsCount || 0} questions
                        {quiz.timeLimit && ` \u00B7 ${quiz.timeLimit} min`}
                      </p>
                    </div>
                    <Link
                      href={`/quizzes/${quiz._id}`}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                        color: "white",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {isTeacherOrAdmin ? "View" : "Take Quiz"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Add Resource Modal */}
      <AnimatePresence>
        {showAddResource && (
          <AddResourceModal
            subjectId={subject._id}
            onClose={() => setShowAddResource(false)}
            onSuccess={() => {
              setShowAddResource(false);
              fetchSubject();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function getResourceIcon(type: string) {
  switch (type) {
    case "youtube":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "pdf":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
  }
}

interface AddResourceModalProps {
  subjectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddResourceModal({ subjectId, onClose, onSuccess }: AddResourceModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    type: "article" as "youtube" | "article" | "pdf",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/subjects/${subjectId}/resources`, formData);
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add resource";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl"
        style={{
          background: "rgba(20, 20, 25, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Add Resource
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: "rgba(255, 255, 255, 0.4)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
              style={inputStyle}
              placeholder="Resource title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
              style={inputStyle}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "youtube" | "article" | "pdf" })}
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
              style={inputStyle}
            >
              <option value="article" style={{ background: "#1a1a2e" }}>Article</option>
              <option value="youtube" style={{ background: "#1a1a2e" }}>YouTube Video</option>
              <option value="pdf" style={{ background: "#1a1a2e" }}>PDF Document</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                color: "white",
                fontFamily: "var(--font-body)",
              }}
            >
              {loading ? "Adding..." : "Add Resource"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
