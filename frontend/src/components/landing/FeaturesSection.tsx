"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Feature data for LearnInsight
const features = [
  {
    id: "quizzes",
    title: "AI-Generated Quizzes",
    description:
      "Upload your syllabus and our AI creates custom quizzes tailored to your curriculum. Practice with questions that adapt to your learning pace.",
    icon: "quiz",
    color: "#F97316",
    duration: 8000,
  },
  {
    id: "analytics",
    title: "Progress Analytics",
    description:
      "Visualize your learning journey with comprehensive dashboards. Track completion rates, quiz scores, and study time across all subjects.",
    icon: "chart",
    color: "#3B82F6",
    duration: 8000,
  },
  {
    id: "videos",
    title: "Video Recommendations",
    description:
      "Get personalized YouTube tutorials based on your weak areas. AI curates the best educational content to fill knowledge gaps.",
    icon: "video",
    color: "#F97316",
    duration: 8000,
  },
  {
    id: "insights",
    title: "Smart Insights",
    description:
      "AI analyzes your performance patterns to identify strengths and areas for improvement. Get actionable recommendations to optimize your study time.",
    icon: "sparkle",
    color: "#3B82F6",
    duration: 8000,
  },
];

// Card configurations
const cardConfigs = [
  {
    badge: "Learning Tools",
    heading: "Master your subjects with AI",
    metrics: [
      {
        icon: "brain",
        title: "Personalized",
        description: "Adaptive learning paths",
      },
      {
        icon: "target",
        title: "Focused",
        description: "Target weak areas",
      },
      {
        icon: "clock",
        title: "Efficient",
        description: "Save study time",
      },
    ],
    features: features.slice(0, 2),
  },
  {
    badge: "Smart Features",
    heading: "Learn smarter, not harder",
    metrics: [
      {
        icon: "video",
        title: "Curated Content",
        description: "Best tutorials selected",
      },
      {
        icon: "sparkle",
        title: "AI-Powered",
        description: "Intelligent recommendations",
      },
      {
        icon: "chart",
        title: "Data-Driven",
        description: "Track your progress",
      },
    ],
    features: features.slice(2, 4),
  },
];

// Icons component
const FeatureIcon = ({ type, size = 24, color = "currentColor" }: { type: string; size?: number; color?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    quiz: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M9 12h6M9 16h6M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6l4 4v12a2 2 0 0 1-2 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 3v4h4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="1" fill={color} />
      </svg>
    ),
    chart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 9l-5 5-4-4-3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    video: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M10 9l5 3-5 3V9z" fill={color} stroke="none" />
      </svg>
    ),
    sparkle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4l2.2 2.2M5.6 18.4l2.2-2.2m8.4-8.4l2.2-2.2" strokeLinecap="round" />
      </svg>
    ),
    brain: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 21.5V4.5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1 1.32 4.24 3 3 0 0 1-.34 5.58 2.5 2.5 0 0 1-2.96 3.08A2.5 2.5 0 0 1 12 21.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    target: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return <>{icons[type] || icons.chart}</>;
};

// Feature Card Component
interface FeatureCardProps {
  config: (typeof cardConfigs)[0];
  isReversed?: boolean;
}

function FeatureCard({ config, isReversed = false }: FeatureCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const activeFeature = config.features[activeIndex];
  const currentDuration = activeFeature.duration || 8000;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % config.features.length);
    setAnimationKey((prev) => prev + 1);
    setProgressKey((prev) => prev + 1);
  }, [config.features.length]);

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

  const handleFeatureClick = (index: number) => {
    setActiveIndex(index);
    setAnimationKey((prev) => prev + 1);
    setProgressKey((prev) => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Top Section - Badge + Heading + Metrics */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Badge + Heading */}
          <div>
            {/* Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-[1px]"
                style={{ background: "var(--color-primary)" }}
              />
              <span
                className="text-xs uppercase tracking-widest"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-primary)",
                  letterSpacing: "0.15em",
                }}
              >
                {config.badge}
              </span>
            </div>
            <h3
              className="text-2xl md:text-3xl lg:text-4xl"
              style={{
                fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                fontWeight: 600,
                lineHeight: "1.2",
                color: "var(--text-primary)",
              }}
            >
              {config.heading}
            </h3>
          </div>

          {/* Right: Metrics */}
          <div className="flex flex-wrap gap-4 lg:gap-0">
            {config.metrics.map((metric, index) => (
              <div
                key={index}
                className="flex-1 min-w-[130px] lg:min-w-[150px] flex"
              >
                <div className="flex-1 lg:px-5">
                  <div className="mb-2" style={{ color: "var(--text-muted)" }}>
                    <FeatureIcon type={metric.icon} size={20} />
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
                {index < config.metrics.length - 1 && (
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
      </div>

      {/* Card Container */}
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
            <div
              className="relative h-[300px] sm:h-[350px] lg:h-[400px] rounded-xl overflow-hidden flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at center, ${activeFeature.color}15 0%, transparent 70%)`,
                border: "1px solid var(--border-subtle)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeFeature.id}-${animationKey}`}
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
                      background: `${activeFeature.color}20`,
                      border: `1px solid ${activeFeature.color}40`,
                    }}
                  >
                    <FeatureIcon type={activeFeature.icon} size={48} color={activeFeature.color} />
                  </motion.div>

                  {/* Feature Title in Visual */}
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
                        color: activeFeature.color,
                      }}
                    >
                      {activeFeature.title}
                    </span>
                  </motion.div>

                  {/* Decorative Elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Floating dots */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          background: activeFeature.color,
                          opacity: 0.3,
                          left: `${20 + i * 12}%`,
                          top: `${15 + (i % 3) * 25}%`,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.3,
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

          {/* Content Area */}
          <div
            className={`p-6 lg:p-10 flex flex-col justify-center ${isReversed ? "lg:order-1" : "lg:order-2"}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeFeature.id}-content-${animationKey}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Feature Icon + Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${activeFeature.color}15`,
                      border: `1px solid ${activeFeature.color}30`,
                    }}
                  >
                    <FeatureIcon type={activeFeature.icon} size={22} color={activeFeature.color} />
                  </div>
                  <h4
                    className="text-xl md:text-2xl lg:text-3xl"
                    style={{
                      fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {activeFeature.title}
                  </h4>
                </div>

                {/* Description */}
                <p
                  className="text-base md:text-lg mb-8 leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    lineHeight: "1.7",
                    color: "var(--text-secondary)",
                  }}
                >
                  {activeFeature.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Feature Tabs with Progress */}
            <div className="space-y-0">
              {/* Top divider */}
              <div
                className="h-px w-full"
                style={{
                  background: "linear-gradient(to right, transparent, var(--border-color), transparent)",
                }}
              />
              {config.features.map((feature, index) => (
                <div key={feature.id}>
                  <button
                    onClick={() => handleFeatureClick(index)}
                    className={`w-full text-left py-4 transition-all cursor-pointer relative ${
                      activeIndex === index ? "opacity-100" : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1.5 h-1.5 rounded-full transition-colors"
                        style={{
                          background: activeIndex === index ? feature.color : "var(--text-muted)",
                        }}
                      />
                      <span
                        className="text-sm md:text-base font-medium transition-colors"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: activeIndex === index ? "var(--text-primary)" : "var(--text-secondary)",
                        }}
                      >
                        {feature.title}
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
                            style={{ background: feature.color }}
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
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 lg:py-32 overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Subtle gradient accents */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div
              className="w-12 h-[1px]"
              style={{ background: "var(--color-primary)" }}
            />
            <span
              className="text-xs uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-primary)",
                letterSpacing: "0.2em",
              }}
            >
              Features
            </span>
            <div
              className="w-12 h-[1px]"
              style={{ background: "var(--color-primary)" }}
            />
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl max-w-3xl mx-auto"
            style={{
              fontFamily: "var(--font-hk-grotesk), var(--font-display)",
              fontWeight: 600,
              lineHeight: "1.1",
              color: "var(--text-primary)",
            }}
          >
            Everything you need to{" "}
            <span style={{ color: "var(--color-primary)" }}>learn smarter</span>
          </h2>
        </motion.div>

        {/* Feature Cards */}
        <div className="space-y-12 lg:space-y-20">
          <FeatureCard config={cardConfigs[0]} />
          <FeatureCard config={cardConfigs[1]} isReversed />
        </div>
      </div>
    </section>
  );
}
