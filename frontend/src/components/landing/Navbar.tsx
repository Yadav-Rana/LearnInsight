"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <>
      {/* Floating Navbar Container */}
      <nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between gap-3">
        {/* Left Bar - Logo + Links */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-300"
          style={{
            background: isScrolled ? "rgba(17, 17, 17, 0.9)" : "transparent",
            backdropFilter: isScrolled ? "blur(20px)" : "none",
            WebkitBackdropFilter: isScrolled ? "blur(20px)" : "none",
            boxShadow: isScrolled ? "0 4px 24px rgba(0, 0, 0, 0.3)" : "none",
          }}
        >
          {/* Logo - Text only */}
          <Link href="/">
            <span
              className="text-lg sm:text-xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              LearnInsight
            </span>
          </Link>

          {/* Spacer */}
          <div className="hidden lg:block w-8" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
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
          className="flex items-center gap-2"
        >
          {/* Desktop buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm transition-colors"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              Sign In
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="px-5 py-2 rounded-full text-sm cursor-pointer"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  color: "#ffffff",
                }}
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile CTA */}
          <div className="lg:hidden">
            <Link href="/register">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-3 py-1.5 rounded-full text-xs cursor-pointer"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  color: "#ffffff",
                }}
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Hamburger Menu Button - Simple lines */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden p-2 cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <span
                className="block h-0.5 w-full transition-transform"
                style={{
                  background: "currentColor",
                  transform: isMobileMenuOpen ? "rotate(45deg) translateY(6px)" : "none",
                }}
              />
              <span
                className="block h-0.5 w-full transition-opacity"
                style={{
                  background: "currentColor",
                  opacity: isMobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-0.5 w-full transition-transform"
                style={{
                  background: "currentColor",
                  transform: isMobileMenuOpen ? "rotate(-45deg) translateY(-6px)" : "none",
                }}
              />
            </div>
          </motion.button>
        </motion.div>
      </nav>

      {/* Mobile Menu Sidepanel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-16 right-4 w-48 z-40 lg:hidden overflow-hidden rounded-lg"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div className="py-2 px-2">
              <nav className="flex flex-col">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className="px-3 py-2 text-sm transition-colors"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {link.label}
                  </a>
                ))}

                <div
                  className="my-1 mx-3"
                  style={{ borderTop: "1px solid var(--border-color)" }}
                />

                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="px-3 py-2 text-sm"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
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
