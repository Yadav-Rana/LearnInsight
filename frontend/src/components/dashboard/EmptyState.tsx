"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center rounded-xl p-8"
      style={{
        background: "rgba(20, 20, 25, 0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div
        className="flex items-center justify-center w-14 h-14 rounded-xl mb-4"
        style={{ background: "rgba(255, 255, 255, 0.04)" }}
      >
        {icon}
      </div>
      <h3
        className="text-base font-semibold mb-1"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      <p
        className="text-sm mb-4"
        style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
      >
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block text-sm px-5 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: "#F97316",
            color: "#000",
            fontFamily: "var(--font-body)",
          }}
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-block text-sm px-5 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: "#F97316",
            color: "#000",
            fontFamily: "var(--font-body)",
          }}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
