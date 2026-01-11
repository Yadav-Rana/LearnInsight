"use client";

interface SectionLabelProps {
  label: string;
}

export default function SectionLabel({ label }: SectionLabelProps) {
  return (
    <div className="mb-4">
      <span
        className="text-xs uppercase tracking-wider"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--label-text)",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
