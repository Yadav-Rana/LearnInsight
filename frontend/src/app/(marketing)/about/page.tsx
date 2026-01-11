"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";

const values = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Innovation First",
    description: "We leverage cutting-edge AI technology to create personalized learning experiences that adapt to each student's needs.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Student-Centered",
    description: "Every feature we build starts with one question: How does this help students learn better and achieve more?",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Trust & Privacy",
    description: "Your data is yours. We maintain the highest standards of security and never share your information with third parties.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Continuous Growth",
    description: "Learning never stops—for our users or for us. We constantly evolve based on feedback and research.",
  },
];

const stats = [
  { value: "10K+", label: "Active Learners" },
  { value: "500+", label: "Quizzes Generated" },
  { value: "95%", label: "Satisfaction Rate" },
  { value: "50+", label: "Subjects Covered" },
];

export default function AboutPage() {
  return (
    <div className="pt-28 md:pt-32 pb-20">
      {/* Hero Section */}
      <section className="px-4 mb-20 md:mb-28">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{
                background: "rgba(249, 115, 22, 0.1)",
                color: "#F97316",
                border: "1px solid rgba(249, 115, 22, 0.2)",
              }}
            >
              About Us
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{
                fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              Empowering Learners with{" "}
              <span style={{ color: "#F97316" }}>AI-Driven</span> Insights
            </h1>
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
                lineHeight: 1.7,
              }}
            >
              We believe everyone deserves access to personalized education.
              LearnInsight combines artificial intelligence with proven learning
              methodologies to help students achieve their full potential.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 mb-20 md:mb-28">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  color: "#3B82F6",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                Our Mission
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{
                  fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                  color: "var(--text-primary)",
                }}
              >
                Making Quality Education Accessible to Everyone
              </h2>
              <p
                className="text-base md:text-lg mb-6"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                }}
              >
                Traditional education often follows a one-size-fits-all approach,
                leaving many students behind. We&apos;re changing that by using AI to
                understand how each person learns best and providing tailored
                recommendations that accelerate growth.
              </p>
              <p
                className="text-base md:text-lg"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                }}
              >
                Our platform identifies knowledge gaps, generates targeted quizzes,
                and recommends resources—all powered by advanced machine learning
                algorithms that get smarter with every interaction.
              </p>
            </div>
            <div
              className="rounded-2xl p-8 md:p-10"
              style={{
                background: "rgba(20, 20, 20, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="text-center p-4"
                  >
                    <div
                      className="text-3xl md:text-4xl font-bold mb-2"
                      style={{
                        fontFamily: "var(--font-hk-grotesk)",
                        color: index % 2 === 0 ? "#F97316" : "#3B82F6",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 mb-20 md:mb-28">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{
                background: "rgba(249, 115, 22, 0.1)",
                color: "#F97316",
                border: "1px solid rgba(249, 115, 22, 0.2)",
              }}
            >
              Our Values
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              What Drives Us Forward
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-6 md:p-8 rounded-2xl transition-all duration-300"
                style={{
                  background: "rgba(20, 20, 20, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: "rgba(249, 115, 22, 0.1)",
                    color: "#F97316",
                  }}
                >
                  {value.icon}
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{
                    fontFamily: "var(--font-hk-grotesk)",
                    color: "var(--text-primary)",
                  }}
                >
                  {value.title}
                </h3>
                <p
                  className="text-sm md:text-base"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--text-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center rounded-2xl p-10 md:p-14"
          style={{
            background: "rgba(20, 20, 20, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-hk-grotesk), var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            Ready to Transform Your Learning?
          </h2>
          <p
            className="text-base md:text-lg mb-8 max-w-xl mx-auto"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-muted)",
            }}
          >
            Join thousands of students already using LearnInsight to achieve their goals faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="orange" size="lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
