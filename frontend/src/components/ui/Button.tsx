"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type ButtonVariant = "orange" | "blue" | "white" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<ButtonVariant, { background: string; color: string; border?: string }> = {
  orange: {
    background: "#F97316",
    color: "#000000",
  },
  blue: {
    background: "#3B82F6",
    color: "#000000",
  },
  white: {
    background: "#ffffff",
    color: "#000000",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-color)",
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2 text-sm",
  lg: "px-8 py-3 text-base",
};

export default function Button({
  children,
  variant = "orange",
  size = "md",
  onClick,
  className = "",
  type = "button",
}: ButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`rounded-full font-medium cursor-pointer ${sizeStyles[size]} ${className}`}
      style={{
        fontFamily: "var(--font-body)",
        background: styles.background,
        color: styles.color,
        border: styles.border || "none",
      }}
    >
      {children}
    </motion.button>
  );
}
