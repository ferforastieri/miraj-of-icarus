import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";
import { classHref, gameClassIds } from "@/components/game/model";
import { getPathname } from "@/i18n/navigation";
import { routes, routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await Promise.all(routing.locales.map(async locale => {
    const t = await getTranslations({ locale, namespace: "Classes" });
    return [
      { url: `${siteConfig.url}${getPathname({ locale, href: routes.home })}`, changeFrequency: "weekly" as const, priority: locale === "pt" ? 1 : 0.9 },
      { url: `${siteConfig.url}${getPathname({ locale, href: routes.game })}`, changeFrequency: "monthly" as const, priority: 0.9 },
      { url: `${siteConfig.url}${getPathname({ locale, href: routes.classes })}`, changeFrequency: "monthly" as const, priority: 0.9 },
      { url: `${siteConfig.url}${getPathname({ locale, href: routes.skills })}`, changeFrequency: "monthly" as const, priority: 0.8 },
      { url: `${siteConfig.url}${getPathname({ locale, href: routes.realms })}`, changeFrequency: "daily" as const, priority: 0.8 },
      { url: `${siteConfig.url}${getPathname({ locale, href: routes.download })}`, changeFrequency: "daily" as const, priority: 0.8 },
      ...gameClassIds.map(classId => ({ url: `${siteConfig.url}${getPathname({ locale, href: classHref(t(`slugs.${classId}`)) })}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ];
  }));
  return entries.flat();
}
