"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Loader } from "@/components/ui";
import {
  WelcomeBanner,
  ContinueLearning,
  StatsCard,
  ChartCard,
} from "@/components/dashboard";
import type { QuizAttempt, Progress, Insight, Quiz, Subject } from "@/types";

const RING_COLORS = ["#3B82F6", "#10B981", "#F97316", "#8B5CF6", "#EC4899"];

const cardStyle: React.CSSProperties = {
  background: "rgba(20, 20, 25, 0.6)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
};

const tooltipStyle: React.CSSProperties = {
  background: "rgba(20, 20, 25, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "var(--font-body)",
};

function sectionMotion(index: number) {
  return {
    initial: { opacity: 0, y: 20 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  };
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    if (!user) return;

    const fetches: Promise<unknown>[] = [
      api.get("/progress").catch(() => ({ data: { data: [] } })),
      api.get("/attempts?limit=10").catch(() => ({ data: { data: [] } })),
    ];

    if (isStudent) {
      fetches.push(api.get("/insights").catch(() => ({ data: { data: [] } })));
    }
    if (isTeacher) {
      fetches.push(api.get("/quizzes").catch(() => ({ data: { data: [] } })));
      fetches.push(api.get("/subjects").catch(() => ({ data: { data: [] } })));
    }

    Promise.all(fetches).then((results) => {
      const progressData = (results[0] as { data: { data: Progress[] } }).data?.data || [];
      const attemptsData = (results[1] as { data: { data: QuizAttempt[] } }).data?.data || [];
      setProgress(progressData);
      setAttempts(attemptsData);

      if (isStudent && results[2]) {
        const insightData = (results[2] as { data: { data: Insight[] } }).data?.data || [];
        setInsights(Array.isArray(insightData) ? insightData : [insightData]);
      }
      if (isTeacher) {
        const quizData = (results[2] as { data: { data: Quiz[] } }).data?.data || [];
        setQuizzes(quizData);
        if (results[3]) {
          const subjectData = (results[3] as { data: { data: Subject[] } }).data?.data || [];
          setSubjects(subjectData);
        }
      }

      setLoading(false);
    });
  }, [user, isStudent, isTeacher]);

  const averageScore = useMemo(() => {
    if (attempts.length === 0) return "--";
    const avg = attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;
    return `${Math.round(avg)}%`;
  }, [attempts]);

  const scoreTrendData = useMemo(() => {
    return [...attempts].reverse().map((a) => {
      const quizName = typeof a.quiz === "object" ? a.quiz.title : "Quiz";
      return {
        name: quizName.length > 10 ? quizName.slice(0, 10) + "..." : quizName,
        score: a.percentage,
      };
    });
  }, [attempts]);

  const subjectCompletionData = useMemo(() => {
    return progress.slice(0, 5).map((p, i) => {
      const name = typeof p.subject === "object" ? p.subject.name : "Subject";
      return {
        name,
        value: Math.round(p.completionRate),
        fill: RING_COLORS[i % RING_COLORS.length],
      };
    });
  }, [progress]);

  const overallAvg = useMemo(() => {
    if (subjectCompletionData.length === 0) return 0;
    return Math.round(
      subjectCompletionData.reduce((s, d) => s + d.value, 0) / subjectCompletionData.length
    );
  }, [subjectCompletionData]);

  const latestInsight = useMemo(() => {
    if (insights.length === 0) return null;
    return insights[0];
  }, [insights]);

  const publishedQuizCount = useMemo(
    () => quizzes.filter((q) => q.isPublished).length,
    [quizzes]
  );

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (isStudent) {
    return <StudentDashboard />;
  }

  return <TeacherDashboard />;

  function StudentDashboard() {
    let sectionIdx = 0;

    return (
      <div className="space-y-6">
        <motion.div {...sectionMotion(sectionIdx++)}>
          <WelcomeBanner user={user!} />
        </motion.div>

        <motion.div {...sectionMotion(sectionIdx++)}>
          <ContinueLearning />
        </motion.div>

        <motion.div {...sectionMotion(sectionIdx++)}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Enrolled Subjects"
              value={user!.enrolledSubjects.length}
              icon={<BookIcon />}
              color="blue"
              index={0}
            />
            <StatsCard
              title="Quizzes Taken"
              value={attempts.length}
              icon={<ClipboardIcon />}
              color="green"
              index={1}
            />
            <StatsCard
              title="Average Score"
              value={averageScore}
              icon={<ChartIcon />}
              color="orange"
              index={2}
            />
            <StatsCard
              title="Study Streak"
              value="0 days"
              icon={<FireIcon />}
              color="purple"
              index={3}
            />
          </div>
        </motion.div>

        <motion.div {...sectionMotion(sectionIdx++)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Score Trend">
              {scoreTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={scoreTrendData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#666", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#666", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "var(--text-primary)" }}
                      itemStyle={{ color: "#F97316" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#F97316"
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p
                  className="text-center py-8 text-sm"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                >
                  Take quizzes to see your score trend
                </p>
              )}
            </ChartCard>

            <ChartCard title="Subject Completion">
              {subjectCompletionData.length > 0 ? (
                <div className="relative">
                  <ResponsiveContainer width="100%" height={200}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      data={subjectCompletionData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={4}
                        background={{ fill: "rgba(255,255,255,0.04)" }}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: "var(--text-primary)" }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p
                        className="text-2xl font-bold"
                        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                      >
                        {overallAvg}%
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                      >
                        Overall
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p
                  className="text-center py-8 text-sm"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                >
                  Enroll in subjects to track completion
                </p>
              )}
            </ChartCard>
          </div>
        </motion.div>

        <motion.div {...sectionMotion(sectionIdx++)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl p-5" style={cardStyle}>
              <h3
                className="text-sm font-semibold mb-4"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                Recent Activity
              </h3>
              {attempts.length > 0 ? (
                <div className="space-y-3">
                  {attempts.slice(0, 5).map((a) => {
                    const quizName = typeof a.quiz === "object" ? a.quiz.title : "Quiz";
                    return (
                      <div key={a._id} className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                          style={{
                            background: "rgba(249, 115, 22, 0.12)",
                            border: "1px solid rgba(249, 115, 22, 0.25)",
                          }}
                        >
                          <ClipboardIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm truncate"
                            style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}
                          >
                            Scored {a.percentage}% on {quizName}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                          >
                            {relativeTime(a.completedAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  className="text-center py-6 text-sm"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                >
                  No recent activity
                </p>
              )}
            </div>

            <div className="rounded-xl p-5" style={cardStyle}>
              <h3
                className="text-sm font-semibold mb-4"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                Recommendations
              </h3>
              {latestInsight && latestInsight.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {latestInsight.recommendations.slice(0, 3).map((rec, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                        style={{
                          background:
                            rec.type === "youtube"
                              ? "rgba(239, 68, 68, 0.12)"
                              : rec.type === "article"
                              ? "rgba(59, 130, 246, 0.12)"
                              : "rgba(16, 185, 129, 0.12)",
                          border: `1px solid ${
                            rec.type === "youtube"
                              ? "rgba(239, 68, 68, 0.25)"
                              : rec.type === "article"
                              ? "rgba(59, 130, 246, 0.25)"
                              : "rgba(16, 185, 129, 0.25)"
                          }`,
                        }}
                      >
                        {rec.type === "youtube" ? (
                          <PlayIcon />
                        ) : rec.type === "article" ? (
                          <ArticleIcon />
                        ) : (
                          <PracticeIcon />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate"
                          style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}
                        >
                          {rec.title}
                        </p>
                        <Link
                          href={rec.url}
                          target="_blank"
                          className="text-xs font-medium"
                          style={{ color: "#F97316", fontFamily: "var(--font-body)" }}
                        >
                          Study Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="text-center py-6 text-sm"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                >
                  Take quizzes to unlock AI recommendations.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div {...sectionMotion(sectionIdx++)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction href="/subjects" label="Browse Subjects" icon={<BookIcon />} color="#3B82F6" />
            <QuickAction href="/quizzes" label="Take a Quiz" icon={<ClipboardIcon />} color="#10B981" />
            <QuickAction href="/progress" label="View Progress" icon={<ChartIcon />} color="#F97316" />
            <QuickAction href="/insights" label="Get Insights" icon={<LightbulbIcon />} color="#8B5CF6" />
          </div>
        </motion.div>
      </div>
    );
  }

  function TeacherDashboard() {
    let sectionIdx = 0;

    const distributionData = [
      { range: "0-20%", count: 0 },
      { range: "20-40%", count: 0 },
      { range: "40-60%", count: 0 },
      { range: "60-80%", count: 0 },
      { range: "80-100%", count: 0 },
    ];

    return (
      <div className="space-y-6">
        <motion.div {...sectionMotion(sectionIdx++)}>
          <WelcomeBanner user={user!} />
        </motion.div>

        <motion.div {...sectionMotion(sectionIdx++)}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Students"
              value={0}
              icon={<UsersIcon />}
              color="blue"
              index={0}
            />
            <StatsCard
              title="Active Quizzes"
              value={publishedQuizCount}
              icon={<ClipboardIcon />}
              color="green"
              index={1}
            />
            <StatsCard
              title="Class Average"
              value="--"
              icon={<ChartIcon />}
              color="orange"
              index={2}
            />
            <StatsCard
              title="Submissions Today"
              value={0}
              icon={<InboxIcon />}
              color="purple"
              index={3}
            />
          </div>
        </motion.div>

        <motion.div {...sectionMotion(sectionIdx++)}>
          <ChartCard title="Class Performance Distribution">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distributionData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#666", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#666", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "var(--text-primary)" }}
                  itemStyle={{ color: "#F97316" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionData.map((_, i) => (
                    <Cell key={i} fill="url(#barGradient)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div {...sectionMotion(sectionIdx++)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl overflow-hidden" style={cardStyle}>
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
              >
                <h3
                  className="text-sm font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  My Quizzes
                </h3>
                <Link
                  href="/quizzes"
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: "rgba(249, 115, 22, 0.1)",
                    border: "1px solid rgba(249, 115, 22, 0.3)",
                    color: "#F97316",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Create Quiz
                </Link>
              </div>
              <div className="p-5">
                {quizzes.length > 0 ? (
                  <div className="space-y-3">
                    {quizzes.slice(0, 5).map((q) => {
                      const subjectName = typeof q.subject === "object" ? q.subject.name : "";
                      return (
                        <div key={q._id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p
                              className="text-sm truncate"
                              style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}
                            >
                              {q.title}
                            </p>
                            {subjectName && (
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                              >
                                {subjectName}
                              </p>
                            )}
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full shrink-0"
                            style={{
                              background: q.isPublished
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(255, 255, 255, 0.06)",
                              color: q.isPublished ? "#10B981" : "var(--text-muted)",
                              border: `1px solid ${
                                q.isPublished
                                  ? "rgba(16, 185, 129, 0.25)"
                                  : "rgba(255, 255, 255, 0.1)"
                              }`,
                            }}
                          >
                            {q.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p
                    className="text-center py-6 text-sm"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                  >
                    No quizzes yet
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={cardStyle}>
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
              >
                <h3
                  className="text-sm font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  My Subjects
                </h3>
                <Link
                  href="/subjects"
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    color: "#3B82F6",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Create Subject
                </Link>
              </div>
              <div className="p-5">
                {subjects.length > 0 ? (
                  <div className="space-y-3">
                    {subjects.slice(0, 5).map((s) => (
                      <div key={s._id} className="flex items-center justify-between gap-3">
                        <p
                          className="text-sm truncate"
                          style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}
                        >
                          {s.name}
                        </p>
                        <span
                          className="text-xs shrink-0"
                          style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                        >
                          {s.resources.length} resources
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-center py-6 text-sm"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                  >
                    No subjects yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div {...sectionMotion(sectionIdx++)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction href="/quizzes" label="Create Quiz" icon={<ClipboardIcon />} color="#10B981" />
            <QuickAction href="/subjects" label="Create Subject" icon={<BookIcon />} color="#3B82F6" />
            <QuickAction href="/progress" label="View Students" icon={<UsersIcon />} color="#F97316" />
            <QuickAction href="/subjects" label="Manage Resources" icon={<FolderIcon />} color="#8B5CF6" />
          </div>
        </motion.div>
      </div>
    );
  }
}

function QuickAction({
  href,
  label,
  icon,
  color,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className="flex flex-col items-center gap-3 p-5 rounded-xl transition-all duration-200"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${color}15`;
          e.currentTarget.style.borderColor = `${color}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
        }}
      >
        <span style={{ color }}>{icon}</span>
        <span
          className="text-sm font-medium text-center"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
        >
          {label}
        </span>
      </Link>
    </motion.div>
  );
}

function BookIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#EF4444" }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#3B82F6" }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#10B981" }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
