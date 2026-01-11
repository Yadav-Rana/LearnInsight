"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full border-2 animate-spin"
            style={{
              borderColor: "var(--color-primary-light)",
              borderTopColor: "var(--color-primary)",
            }}
          />
        </div>
      </div>
    );
  }

  // Don't render landing if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
