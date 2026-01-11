"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { GridBackground, GlowingOrbs, Particles } from "@/components/ui";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      <Navbar />

      {/* Main content with background effects */}
      <main className="flex-1 relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <GridBackground />
          <GlowingOrbs />
          <Particles count={40} color="#F97316" />
        </div>

        {/* Page content */}
        <div className="relative z-10">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
