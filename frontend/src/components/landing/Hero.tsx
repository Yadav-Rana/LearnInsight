"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Subtle background gradient */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
        style={{ background: "var(--color-primary)" }}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-10 md:px-12 lg:px-16 relative z-10 text-center">
        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          Learn <span className="text-gradient">Smarter</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-2xl mx-auto mb-10 text-sm sm:text-base md:text-lg"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            lineHeight: "1.7",
            color: "var(--text-secondary)",
          }}
        >
          AI-powered learning insights that help you track progress,
          identify weak areas, and achieve your goals faster.
        </motion.p>

        {/* Single CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="px-8 py-3 rounded-full text-sm font-medium cursor-pointer"
              style={{
                fontFamily: "var(--font-body)",
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                color: "#ffffff",
              }}
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
