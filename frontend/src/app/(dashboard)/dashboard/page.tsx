"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl"
          style={{ background: "rgba(249, 115, 22, 0.1)" }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full blur-3xl"
          style={{ background: "rgba(59, 130, 246, 0.1)" }}
        />

        <div className="relative z-10">
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: "var(--font-hk-grotesk), var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            Welcome back,{" "}
            <span style={{ color: "#F97316" }}>{user?.name?.split(" ")[0]}</span>!
          </h1>
          <p
            className="mt-3 text-lg"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-muted)",
            }}
          >
            {user?.role === "student"
              ? "Continue your learning journey and track your progress."
              : user?.role === "teacher"
              ? "Manage your courses and monitor student progress."
              : "Manage the platform and oversee all activities."}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Subjects"
          value={user?.enrolledSubjects?.length || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Quizzes Taken"
          value={0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Average Score"
          value="--"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="orange"
        />
        <StatCard
          title="Study Streak"
          value="0 days"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(20, 20, 25, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{
              fontFamily: "var(--font-hk-grotesk)",
              color: "var(--text-primary)",
            }}
          >
            Recent Activity
          </h2>
          <div className="text-center py-8">
            <div
              className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "rgba(255, 255, 255, 0.3)" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
              No recent activity
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255, 255, 255, 0.4)", fontFamily: "var(--font-body)" }}
            >
              Start learning to see your activity here
            </p>
          </div>
        </div>

        {/* Recommended */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(20, 20, 25, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{
              fontFamily: "var(--font-hk-grotesk)",
              color: "var(--text-primary)",
            }}
          >
            Recommended for You
          </h2>
          <div className="text-center py-8">
            <div
              className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "rgba(255, 255, 255, 0.3)" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
              No recommendations yet
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255, 255, 255, 0.4)", fontFamily: "var(--font-body)" }}
            >
              Take quizzes to get personalized recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(20, 20, 25, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{
            fontFamily: "var(--font-hk-grotesk)",
            color: "var(--text-primary)",
          }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            label="Browse Subjects"
            href="/subjects"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            color="blue"
          />
          <QuickActionButton
            label="Take a Quiz"
            href="/quizzes"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            color="green"
          />
          <QuickActionButton
            label="View Progress"
            href="/progress"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="orange"
          />
          <QuickActionButton
            label="Get Insights"
            href="/insights"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorStyles = {
    blue: {
      bg: "rgba(59, 130, 246, 0.15)",
      border: "rgba(59, 130, 246, 0.3)",
      icon: "#3B82F6",
    },
    green: {
      bg: "rgba(34, 197, 94, 0.15)",
      border: "rgba(34, 197, 94, 0.3)",
      icon: "#22C55E",
    },
    orange: {
      bg: "rgba(249, 115, 22, 0.15)",
      border: "rgba(249, 115, 22, 0.3)",
      icon: "#F97316",
    },
    purple: {
      bg: "rgba(168, 85, 247, 0.15)",
      border: "rgba(168, 85, 247, 0.3)",
      icon: "#A855F7",
    },
  };

  const styles = colorStyles[color];

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(20, 20, 25, 0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-xl"
          style={{
            background: styles.bg,
            border: `1px solid ${styles.border}`,
          }}
        >
          <span style={{ color: styles.icon }}>{icon}</span>
        </div>
        <div>
          <p
            className="text-sm"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
          >
            {title}
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-hk-grotesk)" }}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple";
}

function QuickActionButton({ label, href, icon, color }: QuickActionButtonProps) {
  const colorStyles = {
    blue: { hover: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", icon: "#3B82F6" },
    green: { hover: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)", icon: "#22C55E" },
    orange: { hover: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.3)", icon: "#F97316" },
    purple: { hover: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)", icon: "#A855F7" },
  };

  const styles = colorStyles[color];

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-3 p-5 rounded-xl transition-all duration-200 group"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = styles.hover;
        e.currentTarget.style.borderColor = styles.border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
      }}
    >
      <span style={{ color: styles.icon }}>{icon}</span>
      <span
        className="text-sm font-medium text-center"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
    </Link>
  );
}
