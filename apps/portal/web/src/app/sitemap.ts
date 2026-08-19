import type { MetadataRoute } from "next";
import { classHref, gameClasses } from "@/game";
import { getPathname } from "@/i18n/navigation";
import { routes, routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap(locale => [
    { url: `${siteConfig.url}${getPathname({ locale, href: routes.home })}`, changeFrequency: "weekly" as const, priority: locale === "pt" ? 1 : 0.9 },
    { url: `${siteConfig.url}${getPathname({ locale, href: routes.game })}`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${siteConfig.url}${getPathname({ locale, href: routes.realms })}`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${siteConfig.url}${getPathname({ locale, href: routes.download })}`, changeFrequency: "daily" as const, priority: 0.8 },
    ...gameClasses.map(gameClass => ({ url: `${siteConfig.url}${getPathname({ locale, href: classHref(gameClass, locale) })}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ]);
}
