import type { Metadata } from "next";

export const siteConfig = {
  name: "Miraj of Icarus",
  url: "https://mirajoficarus.com",
  locale: "pt_BR",
  description:
    "Portal oficial de Miraj of Icarus, um MMORPG de fantasia. Conheça as classes e os reinos, crie sua conta e acompanhe o desenvolvimento.",
  socialImage: {
    url: "/media/social/miraj-of-icarus-og.jpg",
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: "Miraj of Icarus: um aventureiro alado contempla a cidadela dos reinos",
  },
} as const;

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  index?: boolean;
  follow?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  index = true,
  follow = true,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: index ? { canonical: path } : undefined,
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
      locale: siteConfig.locale,
      url: path,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      images: [siteConfig.socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: siteConfig.socialImage.url, alt: siteConfig.socialImage.alt }],
    },
  };
}

export function privatePageMetadata(title: string, description: string): Metadata {
  return pageMetadata({
    title,
    description,
    path: "/",
    index: false,
    follow: false,
  });
}
