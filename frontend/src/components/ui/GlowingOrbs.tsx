"use client";

import { motion } from "framer-motion";

interface GlowingOrbsProps {
  className?: string;
}

export default function GlowingOrbs({ className = "" }: GlowingOrbsProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Primary orange orb - top right */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
          top: "10%",
          right: "10%",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary blue orb - bottom left */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)",
          bottom: "20%",
          left: "5%",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Accent orb - center */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)",
          top: "40%",
          left: "40%",
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}
