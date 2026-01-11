"use client";

import { motion } from "framer-motion";
import {
  RotatingCard,
  SectionHeader,
  MetricsRow,
  type CardItem,
  type Metric,
} from "./shared";

// Benefit data for LearnInsight
const benefits: CardItem[] = [
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

// Metrics for the top section
const topMetrics: Metric[] = [
  { icon: "check", title: "Proven Results", description: "Students improve faster" },
  { icon: "star", title: "AI-Powered", description: "Smart recommendations" },
  { icon: "rocket", title: "Easy to Use", description: "Start in minutes" },
];

export default function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 lg:py-32 overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Subtle gradient accent */}
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
            <SectionHeader
              badge="Why LearnInsight"
              heading="Built for how you"
              highlightedText="actually learn"
              accentColor="secondary"
            />
            <MetricsRow metrics={topMetrics} />
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <RotatingCard items={benefits} isReversed showStats />
        </motion.div>
      </div>
    </section>
  );
}
