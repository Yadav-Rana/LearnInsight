"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

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
      setError("Failed to generate insights. Please try again later.");
      console.error(err);
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
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: "rgba(249, 115, 22, 0.3)", borderTopColor: "#F97316" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>AI Insights</h1>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>Personalized recommendations based on your learning patterns</p>
        </div>
        <button
          onClick={generateNewInsights}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", color: "white", fontFamily: "var(--font-body)" }}
        >
          {generating ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Generate New Insights
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444" }}>{error}</div>
      )}

      {/* No Insights Yet */}
      {!insight && !error && (
        <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#A855F7" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>No Insights Yet</h3>
          <p className="max-w-md mx-auto mb-6" style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
            Complete some quizzes first, then our AI will analyze your performance and provide personalized recommendations.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/quizzes" className="px-4 py-2.5 rounded-xl font-medium transition-colors" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-secondary)" }}>Take a Quiz</Link>
            <button onClick={generateNewInsights} disabled={generating} className="px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50" style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", color: "white" }}>Generate Insights Anyway</button>
          </div>
        </div>
      )}

      {/* Insights Content */}
      {insight && (
        <>
          <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Last updated: {formatDate(insight.generatedAt)}</p>

          {/* AI Summary */}
          {insight.aiSummary && (
            <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#A855F7" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>AI Summary</h3>
                  <p style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", lineHeight: 1.7 }}>{insight.aiSummary}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
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
                <div className="space-y-4">
                  {insight.weakAreas.map((area, index) => (
                    <div key={index} className="p-4 rounded-xl" style={{ background: "rgba(249, 115, 22, 0.1)", border: "1px solid rgba(249, 115, 22, 0.2)" }}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{area.subject?.name || "Unknown Subject"}</h4>
                        <Link href={`/subjects/${area.subject?._id}`} className="text-xs" style={{ color: "#F97316" }}>Study Now</Link>
                      </div>
                      <p className="text-sm mb-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{area.reason}</p>
                      {area.suggestedAction && <p className="text-sm font-medium" style={{ color: "#F97316" }}>Suggestion: {area.suggestedAction}</p>}
                    </div>
                  ))}
                </div>
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
                <div className="space-y-3">
                  {insight.recommendations.map((rec, index) => (
                    <a key={rec._id || index} href={rec.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                      <div className="flex-shrink-0">{getTypeIcon(rec.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{rec.title}</p>
                        {rec.subject && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{rec.subject}</p>}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3B82F6" }}>{rec.relevance}% match</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Learning Tips */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#22C55E" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Learning Tips
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl" style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                <h4 className="font-medium mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>Consistent Practice</h4>
                <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Take at least one quiz daily to maintain your learning streak.</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                <h4 className="font-medium mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>Review Mistakes</h4>
                <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Focus on questions you got wrong to strengthen weak areas.</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
                <h4 className="font-medium mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>Mix Topics</h4>
                <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Alternate between subjects to improve retention and connections.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
