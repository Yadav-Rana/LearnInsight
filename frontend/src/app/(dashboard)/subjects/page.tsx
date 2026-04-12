"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui";
import { EmptyState } from "@/components/dashboard";
import api from "@/lib/api";

interface Subject {
  _id: string;
  name: string;
  description: string;
  icon: string;
  parent: string | null;
  level: number;
  createdBy: {
    _id: string;
    name: string;
  };
  resources: Array<{
    _id: string;
    title: string;
    url: string;
    type: "youtube" | "article" | "pdf";
  }>;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

const accentColors = [
  "#3B82F6",
  "#22C55E",
  "#A855F7",
  "#F97316",
  "#EC4899",
];

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get("/subjects");
      setSubjects(response.data.data || []);
    } catch (err) {
      setError("Failed to load subjects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rootSubjects = filteredSubjects.filter((s) => !s.parent);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Subjects
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
            {isTeacherOrAdmin ? "Manage subjects and learning materials" : "Browse and enroll in subjects"}
          </p>
        </div>
        {isTeacherOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
              color: "white",
              fontFamily: "var(--font-body)",
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Subject
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: "rgba(255, 255, 255, 0.4)" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#EF4444",
          }}
        >
          {error}
        </div>
      )}

      {/* Subjects Grid */}
      {rootSubjects.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          title="No subjects found"
          description={isTeacherOrAdmin ? "Create your first subject to get started." : "No subjects available yet. Check back later!"}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {rootSubjects.map((subject, index) => (
            <SubjectCard
              key={subject._id}
              subject={subject}
              isTeacherOrAdmin={isTeacherOrAdmin}
              onDelete={fetchSubjects}
              index={index}
            />
          ))}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateSubjectModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchSubjects();
            }}
            subjects={subjects}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface SubjectCardProps {
  subject: Subject;
  isTeacherOrAdmin: boolean;
  onDelete: () => void;
  index: number;
}

function SubjectCard({ subject, isTeacherOrAdmin, onDelete, index }: SubjectCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    try {
      setDeleting(true);
      await api.delete(`/subjects/${subject._id}`);
      onDelete();
    } catch (err) {
      alert("Failed to delete subject");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const iconColors = [
    { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", icon: "#3B82F6" },
    { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)", icon: "#22C55E" },
    { bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)", icon: "#A855F7" },
    { bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.3)", icon: "#F97316" },
    { bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.3)", icon: "#EC4899" },
  ];
  const colorIndex = subject.name.charCodeAt(0) % iconColors.length;
  const colors = iconColors[colorIndex];
  const accentColor = accentColors[colorIndex];

  const resourceCount = subject.resources?.length || 0;
  const maxResources = 10;
  const progressPercent = Math.min((resourceCount / maxResources) * 100, 100);

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: "rgba(20, 20, 25, 0.6)",
        backdropFilter: "blur(20px)",
        border: isHovered ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.06)",
        borderLeft: `3px solid ${accentColor}`,
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div
            className="p-3 rounded-xl"
            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.icon }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          {isTeacherOrAdmin && (
            <div className="flex gap-1">
              <Link
                href={`/subjects/${subject._id}/edit`}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "rgba(255, 255, 255, 0.4)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-50"
                style={{ color: "rgba(255, 255, 255, 0.4)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <h3 className="mt-4 text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          {subject.name}
        </h3>
        <p className="mt-1 text-sm line-clamp-2" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
          {subject.description || "No description available"}
        </p>

        {/* Resource count with progress bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {resourceCount} resources
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255, 255, 255, 0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: accentColor,
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="px-6 py-3"
        style={{ background: "rgba(255, 255, 255, 0.02)", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
      >
        <Link href={`/subjects/${subject._id}`} className="text-sm font-medium" style={{ color: "#F97316" }}>
          View Details →
        </Link>
      </div>
    </motion.div>
  );
}

interface CreateSubjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
}

function CreateSubjectModal({ onClose, onSuccess, subjects }: CreateSubjectModalProps) {
  const [formData, setFormData] = useState({ name: "", description: "", parent: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await api.post("/subjects", { name: formData.name, description: formData.description, parent: formData.parent || null });
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create subject";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        variants={modalOverlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      />
      <motion.div
        className="relative w-full max-w-md rounded-2xl"
        style={{
          background: "rgba(20, 20, 25, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        variants={modalContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Create Subject
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
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Subject Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
              style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-primary)" }}
              placeholder="e.g., Mathematics"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-orange-500/30 resize-none"
              style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-primary)" }}
              placeholder="Brief description..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Parent Subject (Optional)
            </label>
            <select
              value={formData.parent}
              onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              className="w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
              style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-primary)" }}
            >
              <option value="">None (Root Subject)</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors hover:bg-white/5"
              style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "white" }}
            >
              {loading ? "Creating..." : "Create Subject"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
