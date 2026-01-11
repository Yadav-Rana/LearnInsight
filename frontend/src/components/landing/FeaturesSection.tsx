"use client";

import { motion } from "framer-motion";
import {
  RotatingCard,
  SectionHeader,
  MetricsRow,
  type CardItem,
  type Metric,
} from "./shared";

// Feature data for LearnInsight
const features: CardItem[] = [
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
interface CardConfig {
  badge: string;
  heading: string;
  highlightedText?: string;
  metrics: Metric[];
  features: CardItem[];
}

const cardConfigs: CardConfig[] = [
  {
    badge: "Learning Tools",
    heading: "Master your subjects",
    highlightedText: "with AI",
    metrics: [
      { icon: "brain", title: "Personalized", description: "Adaptive learning paths" },
      { icon: "target", title: "Focused", description: "Target weak areas" },
      { icon: "clock", title: "Efficient", description: "Save study time" },
    ],
    features: features.slice(0, 2),
  },
  {
    badge: "Smart Features",
    heading: "Learn smarter,",
    highlightedText: "not harder",
    metrics: [
      { icon: "video", title: "Curated Content", description: "Best tutorials selected" },
      { icon: "sparkle", title: "AI-Powered", description: "Intelligent recommendations" },
      { icon: "chart", title: "Data-Driven", description: "Track your progress" },
    ],
    features: features.slice(2, 4),
  },
];

// Feature Card with header
function FeatureCardWithHeader({ config, isReversed }: { config: CardConfig; isReversed?: boolean }) {
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
          <SectionHeader
            badge={config.badge}
            heading={config.heading}
            highlightedText={config.highlightedText}
            accentColor="primary"
          />
          <MetricsRow metrics={config.metrics} />
        </div>
      </div>

      {/* Card */}
      <RotatingCard items={config.features} isReversed={isReversed} />
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
            <div className="w-12 h-[1px]" style={{ background: "var(--color-primary)" }} />
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
            <div className="w-12 h-[1px]" style={{ background: "var(--color-primary)" }} />
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
          <FeatureCardWithHeader config={cardConfigs[0]} />
          <FeatureCardWithHeader config={cardConfigs[1]} isReversed />
        </div>
      </div>
    </section>
  );
}
