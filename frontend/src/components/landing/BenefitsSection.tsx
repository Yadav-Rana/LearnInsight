"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Benefit data for LearnInsight
const benefits = [
  {
    id: "students",
    title: "For Students",
    description:
      "Take control of your learning journey. Track progress across subjects, identify weak areas with AI insights, and get personalized video recommendations to fill knowledge gaps.",
    icon: "student",
    color: "#F97316",
    stats: [
      { value: "40%", label: "Faster learning" },
      { value: "2x", label: "Better retention" },
    ],
    duration: 8000,
  },
  {
    id: "teachers",
    title: "For Teachers",
    description:
      "Create engaging quizzes in seconds with AI, monitor class performance with detailed analytics, and curate the best educational resources for your students.",
    icon: "teacher",
    color: "#3B82F6",
    stats: [
      { value: "80%", label: "Time saved" },
      { value: "3x", label: "Student engagement" },
    ],
    duration: 8000,
  },
  {
    id: "everyone",
    title: "For Everyone",
    description:
      "Whether you're self-studying or in a classroom, LearnInsight adapts to your needs. Access from any device, track your growth, and achieve your learning goals.",
    icon: "globe",
    color: "#F97316",
    stats: [
      { value: "24/7", label: "Available" },
      { value: "100+", label: "Subjects" },
    ],
    duration: 8000,
  },
];

// Icons component
const BenefitIcon = ({ type, size = 24, color = "currentColor" }: { type: string; size?: number; color?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    student: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    teacher: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 8h4M7 11h6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="9" r="2" />
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    rocket: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return <>{icons[type] || icons.student}</>;
};

// Metrics for the top section
const topMetrics = [
  {
    icon: "check",
    title: "Proven Results",
    description: "Students improve faster",
  },
  {
    icon: "star",
    title: "AI-Powered",
    description: "Smart recommendations",
  },
  {
    icon: "rocket",
    title: "Easy to Use",
    description: "Start in minutes",
  },
];

export default function BenefitsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const activeBenefit = benefits[activeIndex];
  const currentDuration = activeBenefit.duration || 8000;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % benefits.length);
    setAnimationKey((prev) => prev + 1);
    setProgressKey((prev) => prev + 1);
  }, []);

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

  const handleBenefitClick = (index: number) => {
    setActiveIndex(index);
    setAnimationKey((prev) => prev + 1);
    setProgressKey((prev) => prev + 1);
  };

  return (
    <section
      id="benefits"
      className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 lg:py-32 overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Subtle gradient accents */}
      <div
        className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none -translate-y-1/2"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Section - Badge + Heading + Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Badge + Heading */}
            <div>
              {/* Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-[1px]"
                  style={{ background: "var(--color-secondary)" }}
                />
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-secondary)",
                    letterSpacing: "0.15em",
                  }}
                >
                  Why LearnInsight
                </span>
              </div>
              <h2
                className="text-2xl md:text-3xl lg:text-4xl"
                style={{
                  fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                  fontWeight: 600,
                  lineHeight: "1.2",
                  color: "var(--text-primary)",
                }}
              >
                Built for how you{" "}
                <span style={{ color: "var(--color-secondary)" }}>actually learn</span>
              </h2>
            </div>

            {/* Right: Metrics */}
            <div className="flex flex-wrap gap-4 lg:gap-0">
              {topMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex-1 min-w-[130px] lg:min-w-[150px] flex"
                >
                  <div className="flex-1 lg:px-5">
                    <div className="mb-2" style={{ color: "var(--text-muted)" }}>
                      <BenefitIcon type={metric.icon} size={20} />
                    </div>
                    <div
                      className="text-sm font-medium mb-1"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {metric.title}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {metric.description}
                    </div>
                  </div>
                  {/* Vertical Divider */}
                  {index < topMetrics.length - 1 && (
                    <div
                      className="hidden lg:block w-px self-stretch"
                      style={{
                        background: "linear-gradient(to bottom, transparent, var(--border-color), transparent)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Content Area */}
            <div className="p-6 lg:p-10 flex flex-col justify-center order-2 lg:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeBenefit.id}-content-${animationKey}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Benefit Icon + Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${activeBenefit.color}15`,
                        border: `1px solid ${activeBenefit.color}30`,
                      }}
                    >
                      <BenefitIcon type={activeBenefit.icon} size={22} color={activeBenefit.color} />
                    </div>
                    <h3
                      className="text-xl md:text-2xl lg:text-3xl"
                      style={{
                        fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {activeBenefit.title}
                    </h3>
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
                    {activeBenefit.description}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-8 mb-8">
                    {activeBenefit.stats.map((stat, index) => (
                      <div key={index}>
                        <div
                          className="text-2xl md:text-3xl font-bold mb-1"
                          style={{
                            fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                            color: activeBenefit.color,
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
                </motion.div>
              </AnimatePresence>

              {/* Benefit Tabs with Progress */}
              <div className="space-y-0">
                {/* Top divider */}
                <div
                  className="h-px w-full"
                  style={{
                    background: "linear-gradient(to right, transparent, var(--border-color), transparent)",
                  }}
                />
                {benefits.map((benefit, index) => (
                  <div key={benefit.id}>
                    <button
                      onClick={() => handleBenefitClick(index)}
                      className={`w-full text-left py-4 transition-all cursor-pointer relative ${
                        activeIndex === index ? "opacity-100" : "opacity-50 hover:opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full transition-colors"
                          style={{
                            background: activeIndex === index ? benefit.color : "var(--text-muted)",
                          }}
                        />
                        <span
                          className="text-sm md:text-base font-medium transition-colors"
                          style={{
                            fontFamily: "var(--font-body)",
                            color: activeIndex === index ? "var(--text-primary)" : "var(--text-secondary)",
                          }}
                        >
                          {benefit.title}
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
                              style={{ background: benefit.color }}
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
            </div>

            {/* Visual Area */}
            <div className="relative p-6 lg:p-10 order-1 lg:order-2">
              <div
                className="relative h-[300px] sm:h-[350px] lg:h-[450px] rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at center, ${activeBenefit.color}15 0%, transparent 70%)`,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeBenefit.id}-${animationKey}`}
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
                      className="w-28 h-28 md:w-36 md:h-36 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `${activeBenefit.color}20`,
                        border: `1px solid ${activeBenefit.color}40`,
                      }}
                    >
                      <BenefitIcon type={activeBenefit.icon} size={56} color={activeBenefit.color} />
                    </motion.div>

                    {/* Benefit Title in Visual */}
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
                          color: activeBenefit.color,
                        }}
                      >
                        {activeBenefit.title}
                      </span>
                    </motion.div>

                    {/* Stats Display */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex gap-6"
                    >
                      {activeBenefit.stats.map((stat, index) => (
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
                              color: activeBenefit.color,
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

                    {/* Decorative Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Floating circles */}
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-3 h-3 rounded-full"
                          style={{
                            background: activeBenefit.color,
                            opacity: 0.2,
                            left: `${15 + i * 18}%`,
                            top: `${10 + (i % 2) * 70}%`,
                          }}
                          animate={{
                            y: [0, -15, 0],
                            opacity: [0.15, 0.3, 0.15],
                          }}
                          transition={{
                            duration: 4,
                            delay: i * 0.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
