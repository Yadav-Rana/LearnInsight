"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { getMe } from "@/store/slices/authSlice";

const bannerStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(139, 92, 246, 0.08))",
  border: "1px solid rgba(249, 115, 22, 0.25)",
};

const modalCardStyle: React.CSSProperties = {
  background: "rgba(20, 20, 25, 0.95)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

export default function JoinTeacherBanner() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        teacher: { id: string; name: string; email: string };
      }>("/users/join-teacher", { code: code.trim() });
      setSuccess(`Joined ${res.data.teacher.name}'s classroom`);
      // Refresh user so `teacher` is now populated and the banner hides
      await dispatch(getMe()).unwrap().catch(() => {});
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
        setCode("");
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="rounded-xl p-5 flex items-center gap-4 flex-wrap"
        style={bannerStyle}
      >
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Join your teacher
          </h3>
          <p
            className="text-xs"
            style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}
          >
            Enter the invite code from your teacher to unlock their subjects and quizzes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-medium px-4 py-2 rounded-lg shrink-0"
          style={{
            background: "rgba(249, 115, 22, 0.18)",
            border: "1px solid rgba(249, 115, 22, 0.45)",
            color: "#F97316",
            fontFamily: "var(--font-body)",
          }}
        >
          Enter invite code
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.65)" }}
            onClick={() => !submitting && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={modalCardStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-base font-semibold mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                Join a teacher
              </h3>
              <p
                className="text-xs mb-4"
                style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
              >
                Codes look like <span className="font-mono">TCH-XXXX</span>.
              </p>

              <form onSubmit={submit} className="space-y-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="TCH-XXXX"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg font-mono tracking-widest text-center text-base"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />

                {error && (
                  <p
                    className="text-xs"
                    style={{ color: "#EF4444", fontFamily: "var(--font-body)" }}
                  >
                    {error}
                  </p>
                )}
                {success && (
                  <p
                    className="text-xs"
                    style={{ color: "#10B981", fontFamily: "var(--font-body)" }}
                  >
                    {success}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => !submitting && setOpen(false)}
                    disabled={submitting}
                    className="text-xs font-medium px-4 py-2 rounded-lg disabled:opacity-40"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !code.trim()}
                    className="text-xs font-medium px-4 py-2 rounded-lg disabled:opacity-40"
                    style={{
                      background: "rgba(249, 115, 22, 0.18)",
                      border: "1px solid rgba(249, 115, 22, 0.45)",
                      color: "#F97316",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {submitting ? "Joining…" : "Join classroom"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
