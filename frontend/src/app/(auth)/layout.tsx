"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { GridBackground, GlowingOrbs, Loader, Particles } from "@/components/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
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

  // Don't render auth pages if authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      <Navbar />

      {/* Main content with background effects */}
      <main className="flex-1 relative flex items-center justify-center px-4 pt-32 md:pt-36 pb-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <GridBackground />
          <GlowingOrbs />
          <Particles count={35} color="#F97316" />
        </div>

        {/* Auth content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
