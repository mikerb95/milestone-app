import type { Locale } from "./i18n";

/** Las 6 categorías con las que arranca toda cuenta nueva. */
export const DEFAULT_CATEGORIES = [
  { slug: "financial", emoji: "💰", color: "#F2C94C", es: "Finanzas", en: "Finance" },
  { slug: "growth", emoji: "📚", color: "#A78BFA", es: "Crecimiento", en: "Growth" },
  { slug: "career", emoji: "💼", color: "#6C8CF5", es: "Carrera", en: "Career" },
  { slug: "health", emoji: "🏃", color: "#34D399", es: "Salud", en: "Health" },
  { slug: "personal", emoji: "🌿", color: "#FF8A5B", es: "Personal", en: "Personal" },
  { slug: "creative", emoji: "🎨", color: "#F472B6", es: "Creativo", en: "Creative" },
] as const;

export function categoryName(
  cat: { slug: string | null; name: string; nameEn: string | null },
  locale: Locale,
): string {
  if (locale === "en" && cat.nameEn) return cat.nameEn;
  return cat.name;
}

/** Paleta de los selectores de color de hábitos y categorías. */
export const HABIT_COLORS = [
  "#FF8A5B",
  "#6C8CF5",
  "#22D3EE",
  "#34D399",
  "#A78BFA",
  "#818CF8",
  "#F2C94C",
];

export const GOAL_EMOJI_CHOICES = [
  "🎯", "📚", "💰", "🏃", "💼", "🌿", "🎨", "🧘", "✍️", "🚀", "🏔", "🎓",
];

export const HABIT_EMOJI_CHOICES = [
  "🏋️", "📖", "💧", "👟", "🧘", "🎯", "🍲", "🌅", "💤", "🚭", "🧹", "🎸",
];
