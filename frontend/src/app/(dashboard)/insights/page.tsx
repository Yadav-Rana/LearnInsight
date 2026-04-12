"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Loader } from "@/components/ui";
import { EmptyState } from "@/components/dashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface WeakArea {
  subject: { _id: string; name: string };
  reason: string;
  suggestedAction: string;
}

interface Recommendation {
  _id: string;
  title: string;
  url: string;
  type: "youtube" | "article" | "quiz";
  relevance: number;
  subject?: string;
}

interface Insight {
  _id: string;
  weakAreas: WeakArea[];
  recommendations: Recommendation[];
  aiSummary: string;
  generatedAt: string;
}

export default function InsightsPage() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get("/insights/latest");
      setInsight(response.data.data);
    } catch (err) {
      setInsight(null);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    try {
      setGenerating(true);
      setError("");
      const response = await api.post("/insights/generate");
      setInsight(response.data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate insights. Please try again later.";
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#EF4444" }}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
      case "article":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#3B82F6" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case "quiz":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#22C55E" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>AI Insights</h1>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>Personalized recommendations based on your learning patterns</p>
        </div>
        <button
          onClick={generateNewInsights}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "white", fontFamily: "var(--font-body)" }}
        >
          {generating ? (
            <>
              <Loader size="xs" variant="dots" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Generate New Insights
            </>
          )}
        </button>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="p-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444" }}>{error}</motion.div>
      )}

      {/* No Insights Yet */}
      {!insight && !error && (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#F97316" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            }
            title="No Insights Yet"
            description="Complete some quizzes first, then our AI will analyze your performance and provide personalized recommendations."
            actionLabel="Take a Quiz"
            actionHref="/quizzes"
          />
        </motion.div>
      )}

      {/* Insights Content */}
      {insight && (
        <>
          <motion.p variants={itemVariants} className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Last updated: {formatDate(insight.generatedAt)}</motion.p>

          {/* AI Summary */}
          {insight.aiSummary && (
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-6"
              style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl" style={{ background: "rgba(249, 115, 22, 0.12)", border: "1px solid rgba(249, 115, 22, 0.25)" }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#F97316" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>AI Summary</h3>
                  <p style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", lineHeight: 1.7 }}>{insight.aiSummary}</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
            {/* Weak Areas */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#F97316" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Areas to Improve
              </h3>
              {insight.weakAreas.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#22C55E" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Great job! No weak areas detected.</p>
                </div>
              ) : (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {insight.weakAreas.map((area, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="p-4 rounded-xl"
                      style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{area.subject?.name || "Unknown Subject"}</h4>
                        <Link href={`/subjects/${area.subject?._id}`} className="text-xs" style={{ color: "#F97316" }}>Study Now</Link>
                      </div>
                      <p className="text-sm mb-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{area.reason}</p>
                      {area.suggestedAction && <p className="text-sm font-medium" style={{ color: "#F97316" }}>Suggestion: {area.suggestedAction}</p>}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#3B82F6" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Recommended Resources
              </h3>
              {insight.recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>No recommendations available yet.</p>
                  <p className="text-sm mt-1" style={{ color: "rgba(255, 255, 255, 0.4)" }}>Complete more quizzes to get personalized suggestions.</p>
                </div>
              ) : (
                <motion.div
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {insight.recommendations.map((rec, index) => (
                    <motion.a
                      key={rec._id || index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group hover:bg-white/5"
                      style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255, 255, 255, 0.12)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255, 255, 255, 0.06)"; }}
                    >
                      <div className="flex-shrink-0">{getTypeIcon(rec.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{rec.title}</p>
                        {rec.subject && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{rec.subject}</p>}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3B82F6" }}>{rec.relevance}% match</span>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Learning Tips */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl p-6"
            style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#22C55E" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Learning Tips
            </h3>
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-4 rounded-xl transition-all duration-200 cursor-default"
                style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
              >
                <h4 className="font-medium mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>Consistent Practice</h4>
                <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Take at least one quiz daily to maintain your learning streak.</p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-4 rounded-xl transition-all duration-200 cursor-default"
                style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
              >
                <h4 className="font-medium mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>Review Mistakes</h4>
                <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Focus on questions you got wrong to strengthen weak areas.</p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-4 rounded-xl transition-all duration-200 cursor-default"
                style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
              >
                <h4 className="font-medium mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>Mix Topics</h4>
                <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Alternate between subjects to improve retention and connections.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
