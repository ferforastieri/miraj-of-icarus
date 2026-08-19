import type { Locale } from "@/i18n/routing";

export type GameClass = {
  id: "warrior" | "guardian" | "thief" | "priest" | "wizard" | "archer" | "idoll" | "magician";
  slugs: Record<Locale, string>;
};

export const gameClasses: readonly GameClass[] = [
  { id: "warrior", slugs: { pt: "guerreiro", en: "warrior", es: "guerrero" } },
  { id: "guardian", slugs: { pt: "guardiao", en: "guardian", es: "guardian" } },
  { id: "thief", slugs: { pt: "ladino", en: "thief", es: "picaro" } },
  { id: "priest", slugs: { pt: "sacerdote", en: "priest", es: "sacerdote" } },
  { id: "wizard", slugs: { pt: "mago", en: "wizard", es: "mago" } },
  { id: "archer", slugs: { pt: "arqueiro", en: "archer", es: "arquero" } },
  { id: "idoll", slugs: { pt: "idol", en: "idol", es: "idolo" } },
  { id: "magician", slugs: { pt: "magician", en: "magician", es: "magician" } },
] as const;

export function classHref(gameClass: GameClass, locale: Locale) {
  return { pathname: "/classes/[slug]" as const, params: { slug: gameClass.slugs[locale] } };
}

export function findGameClass(slug: string, locale: Locale) {
  return gameClasses.find(gameClass => gameClass.slugs[locale] === slug);
}

export const prestigeTiers = [
  { id: "bronze", level: 10, color: "#a96743" },
  { id: "silver", level: 20, color: "#b9c8cb" },
  { id: "gold", level: 30, color: "#d2a53f" },
  { id: "platinum", level: 40, color: "#d6e2e4" },
  { id: "topaz", level: 50, color: "#d8842e" },
  { id: "amethyst", level: 60, color: "#955dcc" },
  { id: "obsidian", level: 70, color: "#536172" },
  { id: "jade", level: 80, color: "#679a84" },
  { id: "ruby", level: 90, color: "#bd334c" },
  { id: "fernandium", level: 100, color: "#5f88a6" },
  { id: "miriamite", level: 110, color: "#eadfd3" },
] as const;

export const MAX_CHARACTER_LEVEL = prestigeTiers.at(-1)!.level;
export type PrestigeTier = (typeof prestigeTiers)[number];

export function prestigeTierForLevel(value: number): PrestigeTier {
  const level = Math.min(MAX_CHARACTER_LEVEL, Math.max(0, Math.floor(value)));
  const attained = [...prestigeTiers].reverse().find(tier => level >= tier.level);
  return attained ?? prestigeTiers[0];
}

export function prestigeBlendForLevel(value: number) {
  const level = Math.min(MAX_CHARACTER_LEVEL, Math.max(0, value));
  if (level <= prestigeTiers[0].level) {
    return { from: prestigeTiers[0], to: prestigeTiers[0], progress: level / prestigeTiers[0].level };
  }

  const exact = prestigeTiers.find(tier => tier.level === level);
  if (exact) return { from: exact, to: exact, progress: 1 };

  const from = prestigeTierForLevel(level);
  const to = prestigeTiers.find(tier => tier.level > level) ?? from;
  return { from, to, progress: (level - from.level) / (to.level - from.level || 1) };
}
