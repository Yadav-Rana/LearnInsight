"use client";

import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Benefits", href: "#benefits" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative px-6 py-10 sm:px-8 sm:py-12"
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border-color)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Logo Column */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/">
              <span
                className="text-lg"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)",
                }}
              >
                LearnInsight
              </span>
            </Link>
            <p
              className="text-xs mt-2"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
              }}
            >
              AI-powered learning
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4
              className="text-xs uppercase tracking-wider mb-3"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
              }}
            >
              Product
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--text-secondary)",
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
              className="text-xs uppercase tracking-wider mb-3"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
              }}
            >
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4
              className="text-xs uppercase tracking-wider mb-3"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
              }}
            >
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--text-secondary)",
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
          className="pt-6"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <p
            className="text-xs text-center"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-muted)",
            }}
          >
            {currentYear} LearnInsight. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
