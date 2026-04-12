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
  const [wavePoints, setWavePoints] = useState("");

  useEffect(() => {
    const startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      // Generate wave points for SVG polygon
      const svgHeight = 120;
      const svgWidth = 900;
      const baseY = svgHeight - (newProgress / 100) * svgHeight;
      const waveHeight = 4;
      const time = Date.now() / 400;

      const points = [];
      for (let x = 0; x <= svgWidth; x += 20) {
        const wave = Math.sin((x / 50) + time) * waveHeight;
        const y = baseY + wave;
        points.push(`${x},${y}`);
      }
      // Close the polygon at the bottom
      points.push(`${svgWidth},${svgHeight}`);
      points.push(`0,${svgHeight}`);
      setWavePoints(points.join(" "));

      if (newProgress >= 100) {
        setIsComplete(true);
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 1200);
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
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
            {/* SVG Text with gradient fill - wave clipping */}
            <svg
              className="w-auto h-auto"
              viewBox="0 0 900 120"
              style={{
                width: "min(95vw, 1100px)",
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

                {/* Wave clip path */}
                <clipPath id="waveClip">
                  <polygon points={wavePoints} />
                </clipPath>
              </defs>

              {/* Outline text (always visible) */}
              <text
                x="450"
                y="85"
                textAnchor="middle"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "90px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  fill: "none",
                  stroke: "rgba(249, 115, 22, 0.3)",
                  strokeWidth: "1.5",
                }}
              >
                LearnInsight
              </text>

              {/* Filled text (clipped by wave) */}
              <text
                x="450"
                y="85"
                textAnchor="middle"
                clipPath="url(#waveClip)"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "90px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
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
