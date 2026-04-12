"use client";

import { useRef } from "react";
import { avatarPresets } from "@/lib/avatarPresets";

interface AvatarPickerProps {
  onSelect: (avatarValue: string) => void;
  currentAvatar?: string | null;
}

export default function AvatarPicker({ onSelect, currentAvatar }: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 200, 200);
        onSelect(canvas.toDataURL("image/webp", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "rgba(20, 20, 25, 0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <h4
        className="text-sm mb-3"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
      >
        Choose an Avatar
      </h4>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {avatarPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.id)}
            className="flex items-center justify-center rounded-lg cursor-pointer transition-all"
            style={{
              width: 48,
              height: 48,
              background: preset.gradient,
              border: currentAvatar === preset.id ? "2px solid #F97316" : "2px solid transparent",
              outline: "none",
            }}
          >
            <span style={{ fontSize: 22 }}>{preset.emoji}</span>
          </button>
        ))}
      </div>

      <h4
        className="text-sm mb-3"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
      >
        Upload Photo
      </h4>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
        style={{
          fontFamily: "var(--font-body)",
          background: "rgba(249, 115, 22, 0.1)",
          border: "1px solid rgba(249, 115, 22, 0.3)",
          color: "#F97316",
        }}
      >
        Choose File
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
