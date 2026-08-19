import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localeDetails, pathnames, routing } from "@/i18n/routing";

export const siteConfig = {
  name: "Miraj of Icarus",
  url: "https://mirajoficarus.com",
  defaultDescription:
    "Portal oficial de Miraj of Icarus, um MMORPG de fantasia. Conheça as classes e os reinos, crie sua conta e acompanhe o desenvolvimento.",
  socialImage: {
    url: "/media/social/miraj-of-icarus-og.jpg",
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: "Miraj of Icarus: um aventureiro alado contempla a cidadela dos reinos",
  },
} as const;

type StaticPath = Exclude<keyof typeof pathnames, "/classes/[slug]">;
type PagePath = StaticPath | { pathname: "/classes/[slug]"; params: { slug: string } };

type PageMetadataOptions = {
  locale: Locale;
  title: string;
  description: string;
  path: PagePath | ((locale: Locale) => PagePath);
  absoluteTitle?: boolean;
  index?: boolean;
  follow?: boolean;
  imageAlt?: string;
};

export function pageMetadata({
  locale,
  title,
  description,
  path,
  absoluteTitle = false,
  index = true,
  follow = true,
  imageAlt = siteConfig.socialImage.alt,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;
  const localizedPath = getPathname({ locale, href: typeof path === "function" ? path(locale) : path });
  const languages = Object.fromEntries(
    routing.locales.map(item => [localeDetails[item].htmlLang, getPathname({ locale: item, href: typeof path === "function" ? path(item) : path })]),
  );

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: index ? {
      canonical: localizedPath,
      languages: { ...languages, "x-default": getPathname({ locale: routing.defaultLocale, href: typeof path === "function" ? path(routing.defaultLocale) : path }) },
    } : undefined,
    robots: {
      index,
      follow,
      nocache: !index,
      googleBot: {
        index,
        follow,
        noimageindex: !index,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: localeDetails[locale].htmlLang.replace("-", "_"),
      alternateLocale: routing.locales.filter(item => item !== locale).map(item => localeDetails[item].htmlLang.replace("-", "_")),
      url: localizedPath,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      images: [{ ...siteConfig.socialImage, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: siteConfig.socialImage.url, alt: imageAlt }],
    },
  };
}

export function privatePageMetadata(locale: Locale, title: string, description: string): Metadata {
  return pageMetadata({
    locale,
    title,
    description,
    path: "/",
    index: false,
    follow: false,
  });
}
