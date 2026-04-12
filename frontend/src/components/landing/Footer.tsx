"use client";

import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Benefits", href: "#benefits" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative px-6 pb-12 sm:px-8 sm:pb-16"
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div className="max-w-5xl mx-auto pt-12 sm:pt-16">
        {/* Main Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-12">
          {/* Logo Column */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-block">
              <span
                className="text-lg"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                <span style={{ color: "#F97316" }}>Learn</span>
                <span style={{ color: "#3B82F6" }}>Insight</span>
              </span>
            </Link>
            <p
              className="text-xs mt-3 max-w-[180px]"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
                lineHeight: "1.6",
              }}
            >
              AI-powered learning platform for students and educators.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4
              className="text-xs uppercase tracking-wider mb-4"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
              }}
            >
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4
              className="text-xs uppercase tracking-wider mb-4"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
              }}
            >
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-8 flex items-center justify-center"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-muted)",
            }}
          >
            © {currentYear} LearnInsight. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
