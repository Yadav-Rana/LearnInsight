"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Loader } from "@/components/ui";
import { Avatar, GlassCard, StatsCard } from "@/components/dashboard";

interface Subject {
  _id: string;
  name: string;
  description?: string;
  level?: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  enrolledSubjects?: Subject[];
  createdAt: string;
}

interface ProgressRecord {
  _id: string;
  subject: Subject;
  completionRate: number;
  totalTimeSpent: number;
  lastActivity: string;
  quizStats: {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    passedCount: number;
  };
}

interface WeakArea {
  subject: { _id: string; name: string } | null;
  reason: string;
  severity: "low" | "medium" | "high";
  averageScore: number;
}

interface Insight {
  _id: string;
  aiSummary: string;
  weakAreas: WeakArea[];
  overallStats: {
    averageQuizScore: number;
    totalSubjects: number;
  };
  generatedAt: string;
}

const sectionMotion = (i: number) => ({
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay: i * 0.08 },
});

function formatJoinedDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatTimeSpent(seconds: number): string {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function progressBarColor(pct: number): string {
  if (pct >= 75) return "#22C55E";
  if (pct >= 50) return "#3B82F6";
  if (pct >= 25) return "#EAB308";
  return "rgba(255, 255, 255, 0.3)";
}

const severityStyles: Record<string, { bg: string; border: string; color: string }> = {
  high: { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.3)", color: "#EF4444" },
  medium: { bg: "rgba(234, 179, 8, 0.12)", border: "rgba(234, 179, 8, 0.3)", color: "#EAB308" },
  low: { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)", color: "#3B82F6" },
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [latestInsight, setLatestInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isTeacherOrAdmin = currentUser?.role === "teacher" || currentUser?.role === "admin";

  useEffect(() => {
    if (params.id) fetchStudentData();
  }, [params.id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [userRes, progressRes, insightsRes] = await Promise.all([
        api.get(`/users/${params.id}`),
        api.get(`/progress/user/${params.id}`).catch(() => ({ data: { data: [] } })),
        api.get(`/insights/user/${params.id}`).catch(() => ({ data: { data: [] } })),
      ]);
      setStudent(userRes.data.user || userRes.data.data || null);
      setProgress(progressRes.data.data || []);
      const insightList = insightsRes.data.data || [];
      setLatestInsight(insightList[0] || null);
    } catch {
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  if (!isTeacherOrAdmin) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "#EF4444" }}>You don&apos;t have access to view student details.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-4 text-sm font-medium" style={{ color: "#F97316" }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "#EF4444" }}>{error || "Student not found"}</p>
        <button onClick={() => router.push("/students")} className="mt-4 text-sm font-medium" style={{ color: "#F97316" }}>
          Back to Students
        </button>
      </div>
    );
  }

  const totalAttempts = progress.reduce((sum, p) => sum + (p.quizStats?.totalAttempts || 0), 0);
  const totalTimeSeconds = progress.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0);
  const subjectsWithScores = progress.filter((p) => p.quizStats?.totalAttempts > 0);
  const averageScore = subjectsWithScores.length
    ? Math.round(
        subjectsWithScores.reduce((sum, p) => sum + p.quizStats.averageScore, 0) /
          subjectsWithScores.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.nav {...sectionMotion(0)} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
        <Link href="/students" className="transition-colors hover:text-orange-400" style={{ fontFamily: "var(--font-body)" }}>
          Students
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{student.name}</span>
      </motion.nav>

      {/* Header Card */}
      <motion.div {...sectionMotion(1)}>
        <GlassCard>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar name={student.name} avatar={student.avatar} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                {student.name}
              </h1>
              <p className="mt-1 truncate" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                {student.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                <span className="px-2.5 py-1 rounded-full capitalize" style={{ background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3B82F6" }}>
                  {student.role}
                </span>
                <span>Joined {formatJoinedDate(student.createdAt)}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Row */}
      <motion.div {...sectionMotion(2)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Enrolled Subjects"
          value={student.enrolledSubjects?.length || 0}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          index={0}
        />
        <StatsCard
          title="Quizzes Taken"
          value={totalAttempts}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          index={1}
        />
        <StatsCard
          title="Average Score"
          value={`${averageScore}%`}
          color={averageScore >= 60 ? "green" : "orange"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
          index={2}
        />
        <StatsCard
          title="Time Spent"
          value={formatTimeSpent(totalTimeSeconds)}
          color="purple"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          index={3}
        />
      </motion.div>

      {/* Latest Insight */}
      {latestInsight && (
        <motion.div {...sectionMotion(3)}>
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#A855F7" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Latest AI Insight
              </h2>
              <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                {new Date(latestInsight.generatedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              {latestInsight.aiSummary}
            </p>
            {latestInsight.weakAreas.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                  Weak Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {latestInsight.weakAreas.map((w, i) => {
                    const sev = severityStyles[w.severity] || severityStyles.medium;
                    return (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color }}>
                        {w.subject?.name || "Unknown"} — {w.averageScore}%
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Progress by Subject */}
      <motion.div {...sectionMotion(4)}>
        <GlassCard>
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Progress by Subject
          </h2>
          {progress.length === 0 ? (
            <p className="text-center py-8" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
              No progress recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {progress.map((p) => {
                const color = progressBarColor(p.completionRate);
                return (
                  <Link
                    key={p._id}
                    href={`/subjects/${p.subject._id}`}
                    className="block p-4 rounded-xl transition-all duration-200 hover:bg-white/5"
                    style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                        {p.subject.name}
                      </h3>
                      <span className="text-sm font-medium" style={{ color, fontFamily: "var(--font-body)" }}>
                        {p.completionRate}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.completionRate}%`, background: color }} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                      <span>{p.quizStats?.totalAttempts || 0} attempts</span>
                      <span style={{ opacity: 0.3 }}>·</span>
                      <span>Avg {p.quizStats?.averageScore || 0}%</span>
                      <span style={{ opacity: 0.3 }}>·</span>
                      <span>Best {p.quizStats?.bestScore || 0}%</span>
                      <span style={{ opacity: 0.3 }}>·</span>
                      <span>{formatTimeSpent(p.totalTimeSpent || 0)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Enrolled Subjects */}
      {(student.enrolledSubjects?.length ?? 0) > 0 && (
        <motion.div {...sectionMotion(5)}>
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Enrolled Subjects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.enrolledSubjects?.map((s) => (
                <Link
                  key={s._id}
                  href={`/subjects/${s._id}`}
                  className="p-4 rounded-xl transition-all duration-200 hover:translate-y-[-1px]"
                  style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <h3 className="font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    {s.name}
                  </h3>
                  {s.description && (
                    <p className="text-sm mt-1 line-clamp-2" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                      {s.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
