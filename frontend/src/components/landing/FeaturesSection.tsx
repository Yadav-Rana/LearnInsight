"use client";

import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";

const features = [
  {
    title: "AI-Generated Quizzes",
    description:
      "Upload your syllabus and our AI creates custom quizzes tailored to your curriculum.",
  },
  {
    title: "Progress Analytics",
    description:
      "Visualize your learning journey with comprehensive dashboards and insights.",
  },
  {
    title: "Video Recommendations",
    description:
      "Get personalized YouTube tutorials based on your weak areas.",
  },
  {
    title: "Smart Insights",
    description:
      "AI analyzes your performance to identify strengths and areas for improvement.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative px-4 sm:px-6 md:px-8 py-16 md:py-20 lg:py-24 overflow-hidden"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <SectionLabel label="Features" />
          <h2
            className="text-2xl md:text-3xl lg:text-4xl mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              lineHeight: "1.2",
              color: "var(--text-primary)",
            }}
          >
            Everything You Need
          </h2>
          <p
            className="max-w-xl mx-auto text-sm sm:text-base"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-secondary)",
              lineHeight: "1.7",
            }}
          >
            Our platform combines AI technology with proven learning methods.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="p-6 lg:p-8 rounded-lg transition-all duration-300"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
              }}
            >
              {/* Title */}
              <h3
                className="text-base lg:text-lg mb-3"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--text-muted)",
                  lineHeight: "1.7",
                }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
