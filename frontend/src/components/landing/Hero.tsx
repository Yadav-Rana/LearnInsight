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
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-12 lg:px-16 relative z-10 text-center">
        {/* Main Heading - Two Lines */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6"
        >
          <span
            className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              lineHeight: "1",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            Learn{" "}
            <span className="text-shimmer">Smarter</span>
          </span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2 sm:mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
              color: "var(--text-secondary)",
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
