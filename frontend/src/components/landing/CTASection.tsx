"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section
      className="relative px-4 sm:px-6 md:px-8 py-16 md:py-20 lg:py-24 overflow-hidden"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2
            className="text-2xl md:text-3xl lg:text-4xl mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              lineHeight: "1.2",
              color: "var(--text-primary)",
            }}
          >
            Ready to start?
          </h2>

          <p
            className="text-sm sm:text-base mb-8"
            style={{
              fontFamily: "var(--font-body)",
              lineHeight: "1.7",
              color: "var(--text-secondary)",
            }}
          >
            Join thousands of students using LearnInsight to achieve their goals.
          </p>

          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="px-8 py-3 rounded-full text-sm cursor-pointer"
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
