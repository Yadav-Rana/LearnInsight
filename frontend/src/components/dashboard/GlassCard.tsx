"use client";

import { useState, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  accentColor?: string;
  hover?: boolean;
  padding?: string;
  onClick?: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function GlassCard({
  children,
  className = "",
  accentColor,
  hover = true,
  padding = "p-6",
  onClick,
}: GlassCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const borderColor = isHovered && hover
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(255, 255, 255, 0.06)";

  const style: React.CSSProperties = {
    background: "rgba(20, 20, 25, 0.6)",
    backdropFilter: "blur(20px)",
    ...(accentColor
      ? {
          borderTop: `1px solid ${borderColor}`,
          borderRight: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
          borderLeft: `3px solid ${accentColor}`,
        }
      : {
          border: `1px solid ${borderColor}`,
        }),
    transform: isHovered && hover ? "translateY(-2px)" : "translateY(0)",
  };

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`rounded-2xl overflow-hidden transition-all duration-200 ${padding} ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}
