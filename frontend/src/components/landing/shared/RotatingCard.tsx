"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeatureIcon } from "./Icons";

// Types
export interface CardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  duration?: number;
  stats?: { value: string; label: string }[];
}

interface RotatingCardProps {
  items: CardItem[];
  isReversed?: boolean;
  showStats?: boolean;
}

// Floating decorative dots
function FloatingDots({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: color,
            opacity: 0.3,
            left: `${20 + i * 14}%`,
            top: `${12 + (i % 3) * 28}%`,
          }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3.5,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Visual area component
function VisualArea({ item, animationKey }: { item: CardItem; animationKey: number }) {
  return (
    <div
      className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-xl overflow-hidden flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at center, ${item.color}15 0%, transparent 70%)`,
        border: "1px solid var(--border-subtle)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${item.id}-${animationKey}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center gap-6"
        >
          {/* Large Icon */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center"
            style={{
              background: `${item.color}20`,
              border: `1px solid ${item.color}40`,
            }}
          >
            <FeatureIcon type={item.icon} size={48} color={item.color} />
          </motion.div>

          {/* Title in Visual */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <span
              className="text-lg md:text-xl font-medium"
              style={{
                fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                color: item.color,
              }}
            >
              {item.title}
            </span>
          </motion.div>

          {/* Stats in Visual (if available) */}
          {item.stats && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-6"
            >
              {item.stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center px-4 py-2 rounded-lg"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    className="text-lg font-bold"
                    style={{
                      fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                      color: item.color,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <FloatingDots color={item.color} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Content area component
function ContentArea({
  item,
  animationKey,
  showStats,
}: {
  item: CardItem;
  animationKey: number;
  showStats?: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${item.id}-content-${animationKey}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
      >
        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: `${item.color}15`,
              border: `1px solid ${item.color}30`,
            }}
          >
            <FeatureIcon type={item.icon} size={22} color={item.color} />
          </div>
          <h4
            className="text-xl md:text-2xl lg:text-3xl"
            style={{
              fontFamily: "var(--font-hk-grotesk), var(--font-display)",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {item.title}
          </h4>
        </div>

        {/* Description */}
        <p
          className="text-base md:text-lg mb-6 leading-relaxed"
          style={{
            fontFamily: "var(--font-body)",
            lineHeight: "1.7",
            color: "var(--text-secondary)",
          }}
        >
          {item.description}
        </p>

        {/* Stats (if showStats is true) */}
        {showStats && item.stats && (
          <div className="flex gap-8 mb-6">
            {item.stats.map((stat, index) => (
              <div key={index}>
                <div
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{
                    fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                    color: item.color,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs uppercase tracking-wider"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--text-muted)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Progress tabs component
function ProgressTabs({
  items,
  activeIndex,
  currentDuration,
  isPaused,
  progressKey,
  onItemClick,
}: {
  items: CardItem[];
  activeIndex: number;
  currentDuration: number;
  isPaused: boolean;
  progressKey: number;
  onItemClick: (index: number) => void;
}) {
  return (
    <div className="space-y-0">
      {/* Top divider */}
      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(to right, transparent, var(--border-color), transparent)",
        }}
      />
      {items.map((item, index) => (
        <div key={item.id}>
          <button
            onClick={() => onItemClick(index)}
            className={`w-full text-left py-4 transition-all cursor-pointer relative ${
              activeIndex === index ? "opacity-100" : "opacity-50 hover:opacity-75"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{
                  background: activeIndex === index ? item.color : "var(--text-muted)",
                }}
              />
              <span
                className="text-sm md:text-base font-medium transition-colors"
                style={{
                  fontFamily: "var(--font-body)",
                  color: activeIndex === index ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {item.title}
              </span>
            </div>
            {/* Progress bar */}
            {activeIndex === index && (
              <div className="mt-2 ml-[18px]">
                <div
                  className="h-[2px] rounded-full overflow-hidden"
                  style={{ background: "var(--border-subtle)" }}
                >
                  <motion.div
                    key={progressKey}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                    initial={{ width: "0%" }}
                    animate={{ width: isPaused ? undefined : "100%" }}
                    transition={{
                      duration: currentDuration / 1000,
                      ease: "linear",
                    }}
                  />
                </div>
              </div>
            )}
          </button>
          {/* Bottom divider */}
          <div
            className="h-px w-full"
            style={{
              background: "linear-gradient(to right, transparent, var(--border-color), transparent)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Main RotatingCard component
export default function RotatingCard({ items, isReversed = false, showStats = false }: RotatingCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const activeItem = items[activeIndex];
  const currentDuration = activeItem.duration || 8000;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
    setAnimationKey((prev) => prev + 1);
    setProgressKey((prev) => prev + 1);
  }, [items.length]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
        setAnimationKey((prev) => prev + 1);
        setProgressKey((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Auto-rotate timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      handleNext();
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [activeIndex, currentDuration, isPaused, handleNext, progressKey]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    setAnimationKey((prev) => prev + 1);
    setProgressKey((prev) => prev + 1);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Visual Area */}
        <div
          className={`relative p-6 lg:p-10 ${isReversed ? "lg:order-2" : "lg:order-1"}`}
        >
          <VisualArea item={activeItem} animationKey={animationKey} />
        </div>

        {/* Content Area */}
        <div
          className={`p-6 lg:p-10 flex flex-col justify-center ${isReversed ? "lg:order-1" : "lg:order-2"}`}
        >
          <ContentArea item={activeItem} animationKey={animationKey} showStats={showStats} />

          <ProgressTabs
            items={items}
            activeIndex={activeIndex}
            currentDuration={currentDuration}
            isPaused={isPaused}
            progressKey={progressKey}
            onItemClick={handleItemClick}
          />
        </div>
      </div>
    </div>
  );
}
