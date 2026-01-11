"use client";

import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";

const benefits = [
  {
    title: "Smart Insights",
    description: "AI identifies your weak areas and suggests improvements.",
  },
  {
    title: "Track Progress",
    description: "Visualize your learning journey with detailed analytics.",
  },
  {
    title: "Personalized",
    description: "Get recommendations tailored to your learning style.",
  },
];

export default function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="relative px-4 sm:px-6 md:px-8 py-16 md:py-20 lg:py-24 overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <SectionLabel label="Why LearnInsight" />
            <h2
              className="text-2xl md:text-3xl lg:text-4xl"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                lineHeight: "1.2",
                color: "var(--text-primary)",
              }}
            >
              Learn Smarter, Not Harder
            </h2>
          </motion.div>

          {/* Right Column - Benefits List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col gap-6"
          >
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="pb-6"
                style={{
                  borderBottom:
                    index < benefits.length - 1
                      ? "1px solid var(--border-color)"
                      : "none",
                }}
              >
                <h3
                  className="text-sm mb-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {benefit.title}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-body)",
                    lineHeight: "1.7",
                    color: "var(--text-muted)",
                  }}
                >
                  {benefit.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
