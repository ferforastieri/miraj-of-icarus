import type { MetadataRoute } from "next";
import { gameClasses } from "@/data/game-classes";
import { siteConfig } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/o-jogo`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/reinos`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteConfig.url}/download`, changeFrequency: "daily", priority: 0.8 },
  ];

  return pages.concat(
    gameClasses.map(gameClass => ({
      url: `${siteConfig.url}/classes/${gameClass.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );
}
