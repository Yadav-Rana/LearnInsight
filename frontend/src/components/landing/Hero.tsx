"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Particles, GridBackground, GlowingOrbs } from "@/components/ui";

export default function Hero() {
  const [isHovered, setIsHovered] = useState(false);
  const [fillProgress, setFillProgress] = useState(100); // 100 = empty, 0 = full

  useEffect(() => {
    let animationFrame: number;
    const speed = 0.8; // Lower = slower fill

    const animate = () => {
      setFillProgress((prev) => {
        if (isHovered) {
          // Fill up (decrease from 100 to 0)
          const next = prev - speed;
          return next <= 0 ? 0 : next;
        } else {
          // Drain (increase from 0 to 100)
          const next = prev + speed;
          return next >= 100 ? 100 : next;
        }
      });
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isHovered]);

  // Generate wave path based on fill progress
  const getWaveClipPath = (progress: number) => {
    const baseY = progress;
    const waveHeight = 3;
    const time = Date.now() / 500;

    const points = [];
    for (let x = 0; x <= 100; x += 5) {
      const wave = Math.sin((x / 10) + time) * waveHeight;
      const y = baseY + wave;
      points.push(`${x}% ${y}%`);
    }

    return `polygon(${points.join(", ")}, 100% 100%, 0% 100%)`;
  };

  const [clipPath, setClipPath] = useState("inset(100% 0 0 0)");

  useEffect(() => {
    let animationFrame: number;

    const updateClipPath = () => {
      if (fillProgress < 100) {
        setClipPath(getWaveClipPath(fillProgress));
      } else {
        setClipPath("inset(100% 0 0 0)");
      }
      animationFrame = requestAnimationFrame(updateClipPath);
    };

    animationFrame = requestAnimationFrame(updateClipPath);
    return () => cancelAnimationFrame(animationFrame);
  }, [fillProgress]);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background Layers */}
      <GridBackground />
      <GlowingOrbs />
      <Particles count={50} color="#F97316" />

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 md:px-12 lg:px-16 relative z-10 text-center">
        {/* Main Heading - Outline Style */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-4 sm:mb-6"
        >
          {/* First Line - "Learn Smarter" - hover fills both */}
          <span
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Learn - with white fill on hover */}
            <span
              className="relative inline-block hero-text"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                lineHeight: "1",
                letterSpacing: "0.04em",
              }}
            >
              {/* Outline text */}
              <span className="hero-stroke-white">
                Learn
              </span>
              {/* Filled text (white fill on hover with wave) */}
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath }}
              >
                <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Learn
                </span>
              </span>
            </span>

            <span className="hidden sm:inline-block" style={{ width: "0.3em" }}></span>

            {/* Smarter - with orange fill on hover */}
            <span
              className="relative inline-block hero-text"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                lineHeight: "1",
                letterSpacing: "0.04em",
              }}
            >
              {/* Outline text */}
              <span className="hero-stroke-orange">
                Smarter
              </span>
              {/* Filled text (orange fill on hover with wave) */}
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath }}
              >
                <span
                  style={{
                    background: "linear-gradient(180deg, #F97316 0%, #FB923C 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Smarter
                </span>
              </span>
            </span>
          </span>

          {/* Second Line - "Achieve More" */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="block hero-text-secondary mt-2 sm:mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              lineHeight: "1.1",
              letterSpacing: "0.03em",
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
          className="max-w-md sm:max-w-xl mx-auto mb-8 sm:mb-10 text-sm sm:text-base md:text-lg lg:text-xl px-4"
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
