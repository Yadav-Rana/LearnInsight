"use client";

import { FeatureIcon } from "./Icons";

export interface Metric {
  icon: string;
  title: string;
  description: string;
}

interface MetricsRowProps {
  metrics: Metric[];
}

export default function MetricsRow({ metrics }: MetricsRowProps) {
  return (
    <div className="flex flex-wrap gap-4 lg:gap-0">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="flex-1 min-w-[130px] lg:min-w-[150px] flex"
        >
          <div className="flex-1 lg:px-5">
            <div className="mb-2" style={{ color: "var(--text-muted)" }}>
              <FeatureIcon type={metric.icon} size={20} />
            </div>
            <div
              className="text-sm font-medium mb-1"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-primary)",
              }}
            >
              {metric.title}
            </div>
            <div
              className="text-xs"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
              }}
            >
              {metric.description}
            </div>
          </div>
          {/* Vertical Divider */}
          {index < metrics.length - 1 && (
            <div
              className="hidden lg:block w-px self-stretch"
              style={{
                background: "linear-gradient(to bottom, transparent, var(--border-color), transparent)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
