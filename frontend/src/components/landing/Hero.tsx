"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Particles, GridBackground, GlowingOrbs } from "@/components/ui";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background Layers */}
      <GridBackground />
      <GlowingOrbs />
      <Particles count={50} color="#F97316" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-12 lg:px-16 relative z-10 text-center">
        {/* Main Heading - Outline Style */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6"
        >
          {/* First Line - "Learn Smarter" */}
          <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]">
            <span
              style={{
                fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                fontWeight: 600,
                lineHeight: "1",
                letterSpacing: "-0.02em",
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.4)",
              }}
            >
              Learn{" "}
            </span>
            <span
              className="text-shimmer-outline"
              style={{
                fontFamily: "var(--font-hk-grotesk), var(--font-display)",
                fontWeight: 600,
                lineHeight: "1",
                letterSpacing: "-0.02em",
              }}
            >
              Smarter
            </span>
          </span>

          {/* Second Line - "Achieve More" */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mt-2 sm:mt-4"
            style={{
              fontFamily: "var(--font-hk-grotesk), var(--font-display)",
              fontWeight: 400,
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
              color: "transparent",
              WebkitTextStroke: "1px rgba(255, 255, 255, 0.25)",
            }}
          >
            Achieve More
          </motion.span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-xl mx-auto mb-10 text-base sm:text-lg md:text-xl"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            lineHeight: "1.6",
            color: "var(--text-muted)",
          }}
        >
          AI-powered insights that help you track progress and reach your goals faster.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link href="/register">
            <Button variant="orange" size="lg">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
