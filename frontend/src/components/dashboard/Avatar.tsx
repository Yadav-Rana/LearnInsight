"use client";

import { getPresetById } from "@/lib/avatarPresets";

interface AvatarProps {
  name: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: 32, md: 40, lg: 56 };
const fontSizeMap = { sm: 14, md: 16, lg: 22 };
const emojiSizeMap = { sm: 16, md: 20, lg: 28 };

export default function Avatar({ name, avatar, size = "md" }: AvatarProps) {
  const px = sizeMap[size];
  const baseStyle: React.CSSProperties = {
    width: px,
    height: px,
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (avatar && (avatar.startsWith("http") || avatar.startsWith("data:"))) {
    return (
      <div style={baseStyle}>
        <img
          src={avatar}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  if (avatar && avatar.startsWith("preset-")) {
    const preset = getPresetById(avatar);
    if (preset) {
      return (
        <div style={{ ...baseStyle, background: preset.gradient }}>
          <span style={{ fontSize: emojiSizeMap[size], lineHeight: 1 }}>{preset.emoji}</span>
        </div>
      );
    }
  }

  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      style={{
        ...baseStyle,
        background: "linear-gradient(135deg, #3B82F6, #2563EB)",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: fontSizeMap[size],
        color: "#fff",
      }}
    >
      {initial}
    </div>
  );
}
