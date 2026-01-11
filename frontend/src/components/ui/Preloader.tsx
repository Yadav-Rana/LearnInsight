"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  onComplete?: () => void;
  duration?: number; // in milliseconds
}

export default function Preloader({
  onComplete,
  duration = 2500,
}: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setIsComplete(true);
        // Wait for exit animation before hiding
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 1200);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "var(--bg-primary)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Water Fill Text Container */}
          <motion.div
            className="relative"
            animate={
              isComplete
                ? {
                    scale: [1, 8],
                    opacity: [1, 1, 0],
                  }
                : {}
            }
            transition={{
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1],
              times: [0, 0.7, 1],
            }}
          >
            {/* SVG Text with gradient fill - clean clipping */}
            <svg
              className="w-auto h-auto"
              viewBox="0 0 600 80"
              style={{
                width: "min(90vw, 800px)",
                height: "auto",
              }}
            >
              <defs>
                {/* Gradient for the fill */}
                <linearGradient id="waterGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>

                {/* Clip path for water level */}
                <clipPath id="waterClip">
                  <rect
                    x="0"
                    y={80 - (progress * 0.8)}
                    width="600"
                    height="80"
                  />
                </clipPath>
              </defs>

              {/* Outline text (always visible) */}
              <text
                x="300"
                y="58"
                textAnchor="middle"
                style={{
                  fontFamily: "var(--font-hk-grotesk), 'HK Grotesk', sans-serif",
                  fontSize: "64px",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  fill: "none",
                  stroke: "rgba(249, 115, 22, 0.25)",
                  strokeWidth: "1",
                }}
              >
                LearnInsight
              </text>

              {/* Filled text (clipped by water level) */}
              <text
                x="300"
                y="58"
                textAnchor="middle"
                clipPath="url(#waterClip)"
                style={{
                  fontFamily: "var(--font-hk-grotesk), 'HK Grotesk', sans-serif",
                  fontSize: "64px",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  fill: "url(#waterGradient)",
                }}
              >
                LearnInsight
              </text>
            </svg>
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            className="mt-16 flex flex-col items-center gap-4"
            animate={
              isComplete
                ? {
                    opacity: 0,
                    y: 20,
                  }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            {/* Progress bar */}
            <div
              className="w-48 h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255, 255, 255, 0.1)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #F97316, #3B82F6)",
                  width: `${progress}%`,
                }}
              />
            </div>

            {/* Percentage text */}
            <span
              className="text-sm font-medium tabular-nums"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
              }}
            >
              {Math.round(progress)}%
            </span>
          </motion.div>

          {/* Decorative particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: i % 2 === 0 ? "#F97316" : "#3B82F6",
                  left: `${20 + i * 12}%`,
                  bottom: "20%",
                }}
                animate={{
                  y: [0, -100, -200],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
