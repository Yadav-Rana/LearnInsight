"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  side?: "left" | "right";
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
}

const panelStyle: React.CSSProperties = {
  background: "rgba(15, 15, 20, 0.98)",
  backdropFilter: "blur(24px)",
  borderRight: "1px solid rgba(255, 255, 255, 0.08)",
};

export default function SlidingPanel({
  open,
  onClose,
  title,
  subtitle,
  side = "left",
  width = 420,
  children,
  footer,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lock background scroll while open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const isLeft = side === "left";
  const initialX = isLeft ? -width : width;
  const borderStyle = isLeft
    ? { borderRight: "1px solid rgba(255, 255, 255, 0.08)" }
    : { borderLeft: "1px solid rgba(255, 255, 255, 0.08)" };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0, 0, 0, 0.55)" }}
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: initialX }}
            animate={{ x: 0 }}
            exit={{ x: initialX }}
            transition={{ type: "tween", duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`fixed top-0 bottom-0 ${isLeft ? "left-0" : "right-0"} flex flex-col`}
            style={{
              ...panelStyle,
              ...borderStyle,
              width: `min(${width}px, 100vw)`,
            }}
            role="dialog"
            aria-modal="true"
          >
            {(title || subtitle) && (
              <header
                className="px-5 py-4 flex items-start justify-between gap-4"
                style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
              >
                <div className="min-w-0">
                  {title && (
                    <h2
                      className="text-base font-semibold truncate"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/5 shrink-0"
                  style={{ color: "rgba(255, 255, 255, 0.5)" }}
                  aria-label="Close panel"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </header>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

            {footer && (
              <footer
                className="px-5 py-4"
                style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
              >
                {footer}
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
