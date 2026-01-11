"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#benefits", label: "Benefits" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Glass effect styles - translucent when scrolled
  const getBarStyle = () => {
    if (isScrolled) {
      return {
        background: "rgba(17, 17, 17, 0.4)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      };
    }
    return {
      background: "transparent",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
    };
  };

  return (
    <>
      {/* Floating Navbar Container */}
      <nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between gap-3">
        {/* Left Bar - Logo + Links */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-center px-4 py-2.5 rounded-xl transition-all duration-300"
          style={getBarStyle()}
        >
          {/* Logo - Text only */}
          <Link href="/">
            <span
              className="text-base sm:text-lg"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              LearnInsight
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 ml-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Right Bar - CTA Button + Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300"
          style={getBarStyle()}
        >
          {/* Desktop buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm transition-colors rounded-full"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Sign In
            </Link>
            <Link href="/register">
              <Button variant="orange" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile CTA */}
          <div className="lg:hidden">
            <Link href="/register">
              <Button variant="orange" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Hamburger Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden p-1.5 cursor-pointer rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            aria-label="Toggle menu"
          >
            <div className="w-4 flex flex-col gap-1">
              <span
                className="block h-0.5 w-full transition-all duration-300"
                style={{
                  background: "currentColor",
                  transform: isMobileMenuOpen ? "rotate(45deg) translateY(6px)" : "none",
                }}
              />
              <span
                className="block h-0.5 w-full transition-all duration-300"
                style={{
                  background: "currentColor",
                  opacity: isMobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-0.5 w-full transition-all duration-300"
                style={{
                  background: "currentColor",
                  transform: isMobileMenuOpen ? "rotate(-45deg) translateY(-6px)" : "none",
                }}
              />
            </div>
          </motion.button>
        </motion.div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-4 w-48 z-40 lg:hidden overflow-hidden rounded-xl"
            style={{
              background: "rgba(17, 17, 17, 0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div className="py-3 px-2">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className="px-3 py-2 text-sm transition-colors rounded-lg"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-body)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    {link.label}
                  </a>
                ))}

                <div
                  className="my-2 mx-2"
                  style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
                />

                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  Sign In
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
