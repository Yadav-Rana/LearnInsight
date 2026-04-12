"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui";
import { GlassCard, EmptyState } from "@/components/dashboard";
import api from "@/lib/api";

interface Syllabus {
  _id: string;
  title: string;
  subject: { _id: string; name: string };
  content: string;
  fileType: string;
  status: "pending" | "processing" | "completed" | "failed";
  extractedTopics: { topic: string; subtopics: string[] }[];
  generatedQuizzes: { _id: string; title: string; isPublished: boolean }[];
  uploadedAt: string;
}

interface Subject {
  _id: string;
  name: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const sectionMotion = (i: number) => ({
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay: i * 0.1 },
});

const statusStyles: Record<string, { bg: string; border: string; color: string; label: string }> = {
  pending: { bg: "rgba(234, 179, 8, 0.15)", border: "rgba(234, 179, 8, 0.3)", color: "#EAB308", label: "Pending" },
  processing: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", color: "#3B82F6", label: "Processing" },
  completed: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)", color: "#22C55E", label: "Completed" },
  failed: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", color: "#EF4444", label: "Failed" },
};

const fileTypeStyles: Record<string, { bg: string; border: string; color: string }> = {
  pdf: { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.25)", color: "#EF4444" },
  text: { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.25)", color: "#3B82F6" },
  manual: { bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.25)", color: "#A855F7" },
  docx: { bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.25)", color: "#22C55E" },
};

export default function SyllabusPage() {
  const router = useRouter();
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<string | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
  const [extractingTopics, setExtractingTopics] = useState<string | null>(null);

  useEffect(() => {
    fetchSyllabuses();
  }, []);

  const fetchSyllabuses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/syllabus");
      setSyllabuses(response.data.syllabuses || response.data.data || []);
    } catch {
      setError("Failed to load syllabuses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this syllabus?")) return;
    try {
      await api.delete(`/syllabus/${id}`);
      fetchSyllabuses();
    } catch {
      alert("Failed to delete syllabus");
    }
  };

  const handleExtractTopics = async (id: string) => {
    try {
      setExtractingTopics(id);
      await api.post(`/syllabus/${id}/extract-topics`);
      await fetchSyllabuses();
      setExpandedTopics(id);
    } catch {
      alert("Failed to extract topics");
    } finally {
      setExtractingTopics(null);
    }
  };

  const handleGenerateQuiz = async (id: string) => {
    try {
      setGeneratingQuiz(id);
      const response = await api.post(`/syllabus/${id}/generate-quiz`);
      await fetchSyllabuses();
      const quizId = response.data.quiz?.id;
      if (quizId) router.push(`/quizzes/${quizId}`);
    } catch {
      alert("Failed to generate quiz");
    } finally {
      setGeneratingQuiz(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...sectionMotion(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Syllabus Manager
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
            Upload syllabuses, extract topics, and generate quizzes
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "white", fontFamily: "var(--font-body)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Syllabus
        </button>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444" }}>
          {error}
        </div>
      )}

      {/* Syllabuses Grid */}
      {syllabuses.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="No syllabuses yet"
          description="Upload your first syllabus to extract topics and generate quizzes."
          actionLabel="Upload Syllabus"
          onAction={() => setShowUpload(true)}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {syllabuses.map((syllabus) => {
            const status = statusStyles[syllabus.status] || statusStyles.pending;
            const fileType = fileTypeStyles[syllabus.fileType] || fileTypeStyles.manual;

            return (
              <GlassCard key={syllabus._id} padding="p-0">
                <div className="p-6">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2.5 py-1 text-xs font-medium rounded-full uppercase"
                      style={{ background: fileType.bg, border: `1px solid ${fileType.border}`, color: fileType.color }}
                    >
                      {syllabus.fileType}
                    </span>
                    <span
                      className="px-2.5 py-1 text-xs font-medium rounded-full"
                      style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}
                    >
                      {status.label}
                    </span>
                    {syllabus.subject?.name && (
                      <span
                        className="px-2.5 py-1 text-xs font-medium rounded-full"
                        style={{ background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.25)", color: "#3B82F6" }}
                      >
                        {syllabus.subject.name}
                      </span>
                    )}
                  </div>

                  {/* Title & date */}
                  <h3 className="mt-3 text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    {syllabus.title}
                  </h3>
                  <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                    Uploaded {formatDate(syllabus.uploadedAt)}
                  </p>

                  {/* Stats */}
                  <div className="mt-3 flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
                    {syllabus.extractedTopics?.length > 0 && (
                      <span>{syllabus.extractedTopics.length} topics</span>
                    )}
                    {syllabus.generatedQuizzes?.length > 0 && (
                      <span>{syllabus.generatedQuizzes.length} quizzes</span>
                    )}
                  </div>

                  {/* Expanded Topics */}
                  <AnimatePresence>
                    {expandedTopics === syllabus._id && syllabus.extractedTopics?.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 space-y-2 overflow-hidden"
                      >
                        {syllabus.extractedTopics.map((t, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl"
                            style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
                          >
                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                              {t.topic}
                            </p>
                            {t.subtopics?.length > 0 && (
                              <ul className="mt-1.5 space-y-1">
                                {t.subtopics.map((st, si) => (
                                  <li key={si} className="text-xs flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                                    <span style={{ color: "#F97316" }}>-</span> {st}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setExpandedTopics(expandedTopics === syllabus._id ? null : syllabus._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {syllabus.extractedTopics?.length > 0
                        ? expandedTopics === syllabus._id ? "Hide Topics" : "View Topics"
                        : extractingTopics === syllabus._id ? "Extracting..." : "Extract Topics"}
                    </button>
                    {syllabus.extractedTopics?.length === 0 && expandedTopics !== syllabus._id && (
                      <button
                        onClick={() => handleExtractTopics(syllabus._id)}
                        disabled={extractingTopics === syllabus._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                        style={{
                          background: "rgba(59, 130, 246, 0.1)",
                          border: "1px solid rgba(59, 130, 246, 0.25)",
                          color: "#3B82F6",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {extractingTopics === syllabus._id ? "Extracting..." : "Extract Topics"}
                      </button>
                    )}
                    <button
                      onClick={() => handleGenerateQuiz(syllabus._id)}
                      disabled={generatingQuiz === syllabus._id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                      style={{
                        background: "rgba(249, 115, 22, 0.1)",
                        border: "1px solid rgba(249, 115, 22, 0.25)",
                        color: "#F97316",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {generatingQuiz === syllabus._id ? "Generating..." : "Generate Quiz"}
                    </button>
                    <button
                      onClick={() => handleDelete(syllabus._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#EF4444",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={() => {
              setShowUpload(false);
              fetchSyllabuses();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({ title: "", subject: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/subjects").then((res) => {
      setSubjects(res.data.data || res.data.subjects || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await api.post("/syllabus", {
        title: formData.title,
        subject: formData.subject,
        content: formData.content,
        fileType: "manual",
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload syllabus";
      setError(msg);
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
        className="relative w-full max-w-lg rounded-2xl"
        style={{
          background: "rgba(20, 20, 25, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Upload Syllabus
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
              placeholder="e.g. Data Structures Unit 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              Subject *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
              style={inputStyle}
            >
              <option value="" style={{ background: "#1a1a2e" }}>Select a subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id} style={{ background: "#1a1a2e" }}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={8}
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 resize-none"
              style={inputStyle}
              placeholder="Paste your syllabus content here..."
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
