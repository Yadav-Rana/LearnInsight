"use client";

import { motion } from "framer-motion";
import { getGreeting, getRandomQuote } from "@/lib/quotes";
import Avatar from "./Avatar";
import { useMemo } from "react";

interface WelcomeBannerProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export default function WelcomeBanner({ user }: WelcomeBannerProps) {
  const greeting = getGreeting();
  const firstName = user.name.split(" ")[0];
  const quote = useMemo(() => getRandomQuote(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative rounded-xl p-6 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(59,130,246,0.15) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(249, 115, 22, 0.2)" }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(59, 130, 246, 0.2)" }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl md:text-3xl font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            {greeting}, {firstName}
          </h1>
          <p
            className="text-sm md:text-base italic"
            style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
          >
            &ldquo;{quote.text}&rdquo;
            <span className="not-italic ml-2" style={{ color: "var(--text-secondary)" }}>
              &mdash; {quote.author}
            </span>
          </p>
        </div>
        <div className="ml-4 hidden sm:block">
          <Avatar name={user.name} avatar={user.avatar} size="lg" />
        </div>
      </div>
    </motion.div>
  );
}
