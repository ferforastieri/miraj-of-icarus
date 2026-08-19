export type GameClass = {
  id: "warrior" | "guardian" | "thief" | "priest" | "wizard" | "archer" | "idoll" | "magician";
  slug: string;
};

export const gameClasses: readonly GameClass[] = [
  { id: "warrior", slug: "guerreiro" },
  { id: "guardian", slug: "guardiao" },
  { id: "thief", slug: "ladino" },
  { id: "priest", slug: "sacerdote" },
  { id: "wizard", slug: "mago" },
  { id: "archer", slug: "arqueiro" },
  { id: "idoll", slug: "idol" },
  { id: "magician", slug: "magician" },
] as const;

export function classHref(gameClass: GameClass) {
  return { pathname: "/classes/[slug]" as const, params: { slug: gameClass.slug } };
}

export function findGameClass(slug: string) {
  return gameClasses.find(gameClass => gameClass.slug === slug);
}
