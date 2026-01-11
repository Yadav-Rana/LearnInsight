"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

// Stats for social proof
const stats = [
  { value: "10K+", label: "Students" },
  { value: "500+", label: "Quizzes" },
  { value: "50+", label: "Subjects" },
];

export default function CTASection() {
  return (
    <section
      className="relative px-4 sm:px-6 md:px-8 pt-16 md:pt-24 lg:pt-32 pb-0 overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background gradient accents */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Main CTA Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          {/* Badge */}
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
              Get Started
            </span>
            <div className="w-12 h-[1px]" style={{ background: "var(--color-primary)" }} />
          </div>

          {/* Heading */}
          <h2
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6"
            style={{
              fontFamily: "var(--font-hk-grotesk), var(--font-display)",
              fontWeight: 600,
              lineHeight: "1.1",
              color: "var(--text-primary)",
            }}
          >
            Ready to transform{" "}
            <span
              className="relative inline-block"
              style={{ color: "var(--color-primary)" }}
            >
              your learning
              {/* Underline accent */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 7 Q50 0 100 4 T200 3"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </span>
            ?
          </h2>

          {/* Description */}
          <p
            className="text-base md:text-lg lg:text-xl mb-10 max-w-2xl mx-auto"
            style={{
              fontFamily: "var(--font-body)",
              lineHeight: "1.7",
              color: "var(--text-secondary)",
            }}
          >
            Join thousands of students and educators who are already using
            LearnInsight to achieve their learning goals faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button variant="orange" size="lg">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1"
                  style={{
                    fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
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
          </motion.div>
        </motion.div>
      </div>

      {/* LearnInsight Watermark - with glowing outline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-24 md:mt-32 lg:mt-40 flex justify-center pointer-events-none"
      >
        <span
          className="text-[18vw] md:text-[16vw] lg:text-[14vw] whitespace-nowrap select-none"
          style={{
            fontFamily: "var(--font-hk-grotesk), var(--font-display)",
            fontWeight: 800,
            letterSpacing: "0.02em",
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(249, 115, 22, 0.25)",
            filter: "drop-shadow(0 0 20px rgba(249, 115, 22, 0.15)) drop-shadow(0 0 40px rgba(249, 115, 22, 0.1))",
          }}
        >
          Learn
          <span
            style={{
              WebkitTextStroke: "1.5px rgba(59, 130, 246, 0.25)",
              filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.15)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.1))",
            }}
          >
            Insight
          </span>
        </span>
      </motion.div>
    </section>
  );
}
