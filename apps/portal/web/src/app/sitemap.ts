import type { MetadataRoute } from "next";
import { gameClasses } from "@/data/game-classes";
import { siteConfig } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap(locale => [
    { url: `${siteConfig.url}/${locale}`, changeFrequency: "weekly" as const, priority: locale === "pt" ? 1 : 0.9 },
    { url: `${siteConfig.url}/${locale}/o-jogo`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${siteConfig.url}/${locale}/reinos`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${siteConfig.url}/${locale}/download`, changeFrequency: "daily" as const, priority: 0.8 },
    ...gameClasses.map(gameClass => ({ url: `${siteConfig.url}/${locale}/classes/${gameClass.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ]);
}
