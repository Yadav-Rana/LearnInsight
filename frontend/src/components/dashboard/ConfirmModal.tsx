"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  pending = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const confirmStyle =
    variant === "danger"
      ? {
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          color: "#EF4444",
        }
      : {
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          color: "white",
        };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
            onClick={pending ? undefined : onCancel}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
          <motion.div
            className="relative max-w-md w-full p-6 rounded-2xl"
            style={{
              background: "rgba(20, 20, 24, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            <div
              className="mt-2 text-sm"
              style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
            >
              {description}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onCancel}
                disabled={pending}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={pending}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ ...confirmStyle, fontFamily: "var(--font-body)" }}
              >
                {pending ? "Working..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
