"use client";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "dots" | "wave" | "pulse";
  className?: string;
}

export default function Loader({ size = "md", variant = "dots", className = "" }: LoaderProps) {
  const sizeConfig = {
    xs: { dot: "w-1.5 h-1.5", gap: "gap-1", container: "" },
    sm: { dot: "w-2 h-2", gap: "gap-1.5", container: "" },
    md: { dot: "w-3 h-3", gap: "gap-2", container: "py-4" },
    lg: { dot: "w-4 h-4", gap: "gap-2.5", container: "py-8" },
  };

  const config = sizeConfig[size];

  if (variant === "pulse") {
    return (
      <div className={`flex items-center justify-center ${config.container} ${className}`}>
        <div className="relative">
          <div
            className={`${config.dot} rounded-full animate-loader-pulse`}
            style={{ background: "#F97316" }}
          />
          <div
            className={`absolute inset-0 ${config.dot} rounded-full animate-loader-ping`}
            style={{ background: "rgba(249, 115, 22, 0.4)" }}
          />
        </div>
      </div>
    );
  }

  if (variant === "wave") {
    const barHeight = {
      xs: "h-3",
      sm: "h-4",
      md: "h-6",
      lg: "h-8",
    };
    const barWidth = {
      xs: "w-0.5",
      sm: "w-1",
      md: "w-1.5",
      lg: "w-2",
    };

    return (
      <div className={`flex items-center justify-center ${config.gap} ${config.container} ${className}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`${barWidth[size]} ${barHeight[size]} rounded-full animate-loader-wave`}
            style={{
              background: `linear-gradient(180deg, #F97316 0%, #3B82F6 100%)`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  // Default: dots
  const colors = ["#F97316", "#FB923C", "#3B82F6"];

  return (
    <div className={`flex items-center justify-center ${config.gap} ${config.container} ${className}`}>
      {colors.map((color, i) => (
        <div
          key={i}
          className={`${config.dot} rounded-full animate-loader-bounce`}
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}
