"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Loader, Preloader } from "@/components/ui";
import {
  Navbar,
  Hero,
  BenefitsSection,
  FeaturesSection,
  CTASection,
  Footer,
} from "@/components/landing";

const PRELOADER_SHOWN_KEY = "learninsight_preloader_shown";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [showPreloader, setShowPreloader] = useState(false);
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if preloader was already shown this session
  useEffect(() => {
    setMounted(true);
    const hasSeenPreloader = sessionStorage.getItem(PRELOADER_SHOWN_KEY);
    if (!hasSeenPreloader) {
      setShowPreloader(true);
    } else {
      setPreloaderComplete(true);
    }
  }, []);

  // Mark preloader as shown when it completes
  const handlePreloaderComplete = () => {
    sessionStorage.setItem(PRELOADER_SHOWN_KEY, "true");
    setPreloaderComplete(true);
  };

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Wait for mount to check sessionStorage
  if (!mounted) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--bg-primary)" }}
      />
    );
  }

  // Show preloader only on first visit this session
  if (showPreloader && !preloaderComplete) {
    return (
      <div style={{ background: "var(--bg-primary)" }}>
        <Preloader
          duration={2500}
          onComplete={handlePreloaderComplete}
        />
      </div>
    );
  }

  // Show loading state while auth is checking (after preloader)
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  // Don't render landing if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <motion.main
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Navbar />
      <Hero />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </motion.main>
  );
}
