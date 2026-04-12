"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "blue" | "green" | "orange" | "purple";
  index?: number;
}

const colorMap = {
  blue: { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.25)", text: "#3B82F6" },
  green: { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.25)", text: "#10B981" },
  orange: { bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.25)", text: "#F97316" },
  purple: { bg: "rgba(139, 92, 246, 0.12)", border: "rgba(139, 92, 246, 0.25)", text: "#8B5CF6" },
};

export default function StatsCard({ title, value, icon, color, index = 0 }: StatsCardProps) {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        background: "rgba(20, 20, 25, 0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
      whileHover={{
        y: -2,
        borderColor: "rgba(255, 255, 255, 0.12)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
        >
          {icon}
        </div>
        <div>
          <p
            className="text-xs"
            style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
          >
            {title}
          </p>
          <p
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
