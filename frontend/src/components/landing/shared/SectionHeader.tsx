"use client";

interface SectionHeaderProps {
  badge: string;
  heading: string;
  highlightedText?: string;
  accentColor?: "primary" | "secondary";
}

export default function SectionHeader({
  badge,
  heading,
  highlightedText,
  accentColor = "primary",
}: SectionHeaderProps) {
  const colorVar = accentColor === "primary" ? "var(--color-primary)" : "var(--color-secondary)";

  return (
    <div>
      {/* Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-[1px]"
          style={{ background: colorVar }}
        />
        <span
          className="text-xs uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-body)",
            color: colorVar,
            letterSpacing: "0.15em",
          }}
        >
          {badge}
        </span>
      </div>
      <h3
        className="text-2xl md:text-3xl lg:text-4xl"
        style={{
          fontFamily: "var(--font-hk-grotesk), var(--font-display)",
          fontWeight: 600,
          lineHeight: "1.2",
          color: "var(--text-primary)",
        }}
      >
        {heading}{" "}
        {highlightedText && (
          <span style={{ color: colorVar }}>{highlightedText}</span>
        )}
      </h3>
    </div>
  );
}
