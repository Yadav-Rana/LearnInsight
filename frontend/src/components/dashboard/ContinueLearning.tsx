"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import { Progress, QuizAttempt } from "@/types";

interface LastActivity {
  type: "subject" | "quiz";
  name: string;
  completion: number;
  href: string;
  date: string;
}

export default function ContinueLearning() {
  const [activity, setActivity] = useState<LastActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/progress").catch(() => ({ data: { data: [] } })),
      api.get("/attempts?limit=1").catch(() => ({ data: { data: [] } })),
    ])
      .then(([progressRes, attemptsRes]) => {
        const progressItems: Progress[] = progressRes.data?.data || [];
        const attempts: QuizAttempt[] = attemptsRes.data?.data || [];

        const lastProgress = progressItems.length > 0
          ? [...progressItems].sort(
              (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
            )[0]
          : null;
        const lastAttempt = attempts[0] || null;

        const progressDate = lastProgress ? new Date(lastProgress.lastActivity).getTime() : 0;
        const attemptDate = lastAttempt ? new Date(lastAttempt.completedAt).getTime() : 0;

        if (lastAttempt && attemptDate >= progressDate) {
          const quizName = typeof lastAttempt.quiz === "object" ? lastAttempt.quiz.title : "Quiz";
          const quizId = typeof lastAttempt.quiz === "object" ? lastAttempt.quiz._id : lastAttempt.quiz;
          setActivity({
            type: "quiz",
            name: quizName,
            completion: lastAttempt.percentage,
            href: `/quizzes/${quizId}`,
            date: lastAttempt.completedAt,
          });
        } else if (lastProgress) {
          const subjectName = typeof lastProgress.subject === "object" ? lastProgress.subject.name : "Subject";
          const subjectId = typeof lastProgress.subject === "object" ? lastProgress.subject._id : lastProgress.subject;
          setActivity({
            type: "subject",
            name: subjectName,
            completion: Math.round(lastProgress.completionRate),
            href: `/subjects/${subjectId}`,
            date: lastProgress.lastActivity,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const cardStyle: React.CSSProperties = {
    background: "rgba(20, 20, 25, 0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
  };

  if (!activity) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl p-5"
        style={cardStyle}
      >
        <p
          className="text-sm mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Start your learning journey
        </p>
        <Link
          href="/subjects"
          className="inline-block text-sm px-4 py-2 rounded-lg transition-colors"
          style={{
            fontFamily: "var(--font-body)",
            background: "rgba(249, 115, 22, 0.1)",
            border: "1px solid rgba(249, 115, 22, 0.3)",
            color: "#F97316",
          }}
        >
          Browse Subjects
        </Link>
      </motion.div>
    );
  }

  const label = activity.type === "quiz" ? "Last Quiz" : "Continue Learning";
  const progressLabel = activity.type === "quiz"
    ? `Scored ${activity.completion}%`
    : `${activity.completion}% complete`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl p-5"
      style={cardStyle}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: activity.type === "quiz" ? "rgba(59, 130, 246, 0.15)" : "rgba(249, 115, 22, 0.15)",
            color: activity.type === "quiz" ? "#3B82F6" : "#F97316",
            border: `1px solid ${activity.type === "quiz" ? "rgba(59, 130, 246, 0.3)" : "rgba(249, 115, 22, 0.3)"}`,
          }}
        >
          {activity.type === "quiz" ? "Quiz" : "Subject"}
        </span>
        <h3
          className="text-sm"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          {label}
        </h3>
      </div>
      <p
        className="text-xs mb-3"
        style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
      >
        {activity.name}
      </p>
      <div
        className="w-full h-2 rounded-full mb-3"
        style={{ background: "rgba(255, 255, 255, 0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${activity.completion}%`,
            background: activity.type === "quiz" ? "#3B82F6" : "#F97316",
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {progressLabel}
        </span>
        <Link
          href={activity.href}
          className="text-xs font-medium"
          style={{ color: "#F97316", fontFamily: "var(--font-body)" }}
        >
          {activity.type === "quiz" ? "Retry" : "Resume"}
        </Link>
      </div>
    </motion.div>
  );
}
