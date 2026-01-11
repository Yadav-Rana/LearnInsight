"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Preloader } from "@/components/ui";
import {
  Navbar,
  Hero,
  BenefitsSection,
  FeaturesSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [preloaderComplete, setPreloaderComplete] = useState(false);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show preloader while auth is loading or preloader hasn't completed
  if (isLoading || !preloaderComplete) {
    return (
      <div style={{ background: "var(--bg-primary)" }}>
        <Preloader
          duration={2500}
          onComplete={() => setPreloaderComplete(true)}
        />
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
