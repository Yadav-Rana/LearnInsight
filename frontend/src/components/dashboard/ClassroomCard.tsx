"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";

interface Props {
  studentCount: number;
}

const cardStyle: React.CSSProperties = {
  background: "rgba(20, 20, 25, 0.6)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
};

export default function ClassroomCard({ studentCount }: Props) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ success: boolean; inviteCode: string }>("/users/me/invite-code")
      .then((res) => {
        if (!cancelled) setInviteCode(res.data.inviteCode);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load invite code");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function copyCode() {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  async function regenerate() {
    if (regenerating) return;
    const confirmed = window.confirm(
      "Regenerate invite code? The old code will stop working immediately."
    );
    if (!confirmed) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await api.post<{ success: boolean; inviteCode: string }>(
        "/users/me/regenerate-invite-code"
      );
      setInviteCode(res.data.inviteCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-xl p-5"
      style={cardStyle}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h3
            className="text-sm font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            My Classroom
          </h3>
          <p
            className="text-xs"
            style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
          >
            Share this code with students to add them to your classroom.
          </p>
        </div>
        <Link
          href="/students"
          className="text-xs font-medium px-3 py-1.5 rounded-lg shrink-0"
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "#3B82F6",
            fontFamily: "var(--font-body)",
          }}
        >
          {studentCount} student{studentCount === 1 ? "" : "s"}
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <div
          className="px-4 py-2.5 rounded-lg font-mono text-base tracking-widest select-all"
          style={{
            background: "rgba(249, 115, 22, 0.08)",
            border: "1px dashed rgba(249, 115, 22, 0.35)",
            color: "#F97316",
            minWidth: 160,
            textAlign: "center",
          }}
        >
          {loading ? "Loading…" : inviteCode || "—"}
        </div>

        <button
          type="button"
          onClick={copyCode}
          disabled={!inviteCode}
          className="text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>

        <button
          type="button"
          onClick={regenerate}
          disabled={regenerating || !inviteCode}
          className="text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          {regenerating ? "Regenerating…" : "Regenerate"}
        </button>
      </div>

      {error && (
        <p
          className="text-xs mt-3"
          style={{ color: "#EF4444", fontFamily: "var(--font-body)" }}
        >
          {error}
        </p>
      )}
    </motion.div>
  );
}
