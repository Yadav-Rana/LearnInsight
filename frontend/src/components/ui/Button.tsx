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
  responsive?: boolean;
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

// Fixed size styles
const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2 text-sm",
  lg: "px-8 py-3 text-base",
};

// Responsive size styles - scales with screen size
const responsiveSizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-xs md:px-5 md:py-2 md:text-sm",
  md: "px-4 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm md:px-6 md:py-2.5 md:text-base lg:px-8 lg:py-3",
  lg: "px-5 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base md:px-8 md:py-3 md:text-lg lg:px-10 lg:py-4 lg:text-xl",
};

export default function Button({
  children,
  variant = "orange",
  size = "md",
  onClick,
  className = "",
  type = "button",
  responsive = true,
}: ButtonProps) {
  const styles = variantStyles[variant];
  const sizeClasses = responsive ? responsiveSizeStyles[size] : sizeStyles[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`rounded-full font-medium cursor-pointer ${sizeClasses} ${className}`}
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
