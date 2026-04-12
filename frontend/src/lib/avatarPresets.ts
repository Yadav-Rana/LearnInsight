export interface AvatarPreset {
  id: string;
  emoji: string;
  gradient: string;
}

export const avatarPresets: AvatarPreset[] = [
  { id: "preset-1", emoji: "🦊", gradient: "linear-gradient(135deg, #F97316, #EA580C)" },
  { id: "preset-2", emoji: "🐱", gradient: "linear-gradient(135deg, #3B82F6, #2563EB)" },
  { id: "preset-3", emoji: "🦉", gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)" },
  { id: "preset-4", emoji: "🐼", gradient: "linear-gradient(135deg, #10B981, #059669)" },
  { id: "preset-5", emoji: "🦁", gradient: "linear-gradient(135deg, #F59E0B, #D97706)" },
  { id: "preset-6", emoji: "🐧", gradient: "linear-gradient(135deg, #EC4899, #DB2777)" },
  { id: "preset-7", emoji: "🦄", gradient: "linear-gradient(135deg, #6366F1, #4F46E5)" },
  { id: "preset-8", emoji: "🐉", gradient: "linear-gradient(135deg, #EF4444, #DC2626)" },
];

export function getPresetById(id: string): AvatarPreset | undefined {
  return avatarPresets.find((p) => p.id === id);
}
