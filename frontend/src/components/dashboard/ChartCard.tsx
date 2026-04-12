"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(20, 20, 25, 0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
      >
        <h3
          className="text-sm font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}
