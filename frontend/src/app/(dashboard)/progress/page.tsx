"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Loader } from "@/components/ui";

interface SubjectProgress {
  _id: string;
  subject: { _id: string; name: string };
  completionRate: number;
  totalTimeSpent: number;
  lastActivity: string;
  quizAttempts: number;
}

interface QuizAttempt {
  _id: string;
  quiz: { _id: string; title: string; subject: { _id: string; name: string } };
  score: number;
  percentage: number;
  timeTaken: number;
  completedAt: string;
}

interface ProgressStats {
  totalQuizzesTaken: number;
  averageScore: number;
  totalTimeSpent: number;
  subjectsEnrolled: number;
}

export default function ProgressPage() {
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "history">("overview");

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const [progressRes, attemptsRes] = await Promise.all([
        api.get("/progress"),
        api.get("/attempts?limit=10"),
      ]);

      const progressData = progressRes.data.data || [];
      const attemptsData = attemptsRes.data.data || [];

      setSubjectProgress(progressData);
      setRecentAttempts(attemptsData);

      const totalQuizzes = attemptsData.length;
      const avgScore = totalQuizzes > 0 ? Math.round(attemptsData.reduce((acc: number, a: QuizAttempt) => acc + a.percentage, 0) / totalQuizzes) : 0;
      const totalTime = progressData.reduce((acc: number, p: SubjectProgress) => acc + (p.totalTimeSpent || 0), 0);

      setStats({ totalQuizzesTaken: totalQuizzes, averageScore: avgScore, totalTimeSpent: totalTime, subjectsEnrolled: progressData.length });
    } catch (err) {
      setError("Failed to load progress data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "#22C55E";
    if (percentage >= 60) return "#EAB308";
    return "#EF4444";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 75) return "#22C55E";
    if (rate >= 50) return "#3B82F6";
    if (rate >= 25) return "#EAB308";
    return "rgba(255, 255, 255, 0.3)";
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
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>My Progress</h1>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>Track your learning journey and achievements</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444" }}>{error}</div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Quizzes Taken" value={stats.totalQuizzesTaken.toString()} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} color="blue" />
          <StatCard label="Average Score" value={`${stats.averageScore}%`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} color="green" />
          <StatCard label="Time Spent" value={formatTime(stats.totalTimeSpent)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="purple" />
          <StatCard label="Subjects" value={stats.subjectsEnrolled.toString()} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} color="orange" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
        <nav className="flex gap-8">
          {[{ id: "overview", label: "Overview" }, { id: "subjects", label: "By Subject" }, { id: "history", label: "Quiz History" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="py-3 text-sm font-medium transition-colors"
              style={{
                borderBottom: activeTab === tab.id ? "2px solid #F97316" : "2px solid transparent",
                color: activeTab === tab.id ? "#F97316" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Performance Trend</h3>
            <div className="h-48 flex items-center justify-center rounded-xl" style={{ border: "2px dashed rgba(255, 255, 255, 0.1)" }}>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>Chart coming soon</p>
                <p style={{ color: "rgba(255, 255, 255, 0.4)", fontFamily: "var(--font-body)", fontSize: "0.75rem" }}>Take more quizzes to see your trend</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Recent Activity</h3>
            {recentAttempts.length === 0 ? (
              <div className="text-center py-8">
                <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>No recent activity</p>
                <Link href="/quizzes" className="text-sm mt-2 inline-block" style={{ color: "#F97316" }}>Take a quiz to get started</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttempts.slice(0, 5).map((attempt) => (
                  <div key={attempt._id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{attempt.quiz?.title || "Unknown Quiz"}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(attempt.completedAt)}</p>
                    </div>
                    <span className="font-semibold" style={{ color: getScoreColor(attempt.percentage) }}>{attempt.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="space-y-4">
          {subjectProgress.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <div className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>No subjects yet</h3>
              <p className="mt-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Enroll in subjects to track your progress</p>
              <Link href="/subjects" className="mt-4 inline-block px-4 py-2 rounded-xl font-medium" style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "white" }}>Browse Subjects</Link>
            </div>
          ) : (
            subjectProgress.map((progress) => (
              <div key={progress._id} className="rounded-2xl p-6" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{progress.subject?.name || "Unknown Subject"}</h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{progress.quizAttempts} quizzes taken &bull; {formatTime(progress.totalTimeSpent)} spent</p>
                  </div>
                  <Link href={`/subjects/${progress.subject?._id}`} className="text-sm font-medium" style={{ color: "#F97316" }}>View Details</Link>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--text-muted)" }}>Completion</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{progress.completionRate}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.1)" }}>
                    <div className="h-full transition-all duration-500" style={{ width: `${progress.completionRate}%`, background: getProgressColor(progress.completionRate) }} />
                  </div>
                  {progress.lastActivity && <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.4)" }}>Last activity: {formatDate(progress.lastActivity)}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          {recentAttempts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>No quiz history</h3>
              <p className="mt-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Complete quizzes to see your history here</p>
              <Link href="/quizzes" className="mt-4 inline-block px-4 py-2 rounded-xl font-medium" style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "white" }}>Browse Quizzes</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Quiz</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Score</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Date</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map((attempt) => (
                    <tr key={attempt._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{attempt.quiz?.title || "Unknown"}</p></td>
                      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm" style={{ color: "var(--text-muted)" }}>{attempt.quiz?.subject?.name || "N/A"}</p></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-semibold" style={{ color: getScoreColor(attempt.percentage) }}>{attempt.score} ({attempt.percentage}%)</span></td>
                      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm" style={{ color: "var(--text-muted)" }}>{formatTime(Math.round(attempt.timeTaken / 60))}</p></td>
                      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm" style={{ color: "var(--text-muted)" }}>{formatDate(attempt.completedAt)}</p></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right"><Link href={`/quizzes/${attempt.quiz?._id}`} className="text-sm font-medium" style={{ color: "#F97316" }}>Retry</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorStyles = {
    blue: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", icon: "#3B82F6" },
    green: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)", icon: "#22C55E" },
    purple: { bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)", icon: "#A855F7" },
    orange: { bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.3)", icon: "#F97316" },
  };
  const styles = colorStyles[color];

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl" style={{ background: styles.bg, border: `1px solid ${styles.border}` }}>
          <span style={{ color: styles.icon }}>{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{value}</p>
          <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{label}</p>
        </div>
      </div>
    </div>
  );
}
