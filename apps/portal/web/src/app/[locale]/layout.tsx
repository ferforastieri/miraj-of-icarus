import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { QueryProvider } from "@/app/api/_react-query/QueryProvider";
import { JadeCursor } from "@/components/ui/JadeCursor";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { ServiceWorkerRegistration } from "@/components/system/ServiceWorkerRegistration";
import { pageMetadata, siteConfig } from "@/lib/seo";
import { localeDetails, routing, type Locale } from "@/i18n/routing";
import "../globals.css";

type LayoutProps = Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>;

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: requestedLocale } = await params;
  if (!hasLocale(routing.locales, requestedLocale)) notFound();
  const locale = requestedLocale as Locale;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("homeTitle");

  return {
    ...pageMetadata({ locale, title, description: t("siteDescription"), path: "/", absoluteTitle: true, imageAlt: t("socialAlt") }),
    title: { default: title, template: `%s | ${siteConfig.name}` },
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "games",
    manifest: "/manifest.webmanifest",
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false, email: false, address: false },
    icons: {
      icon: [
        { url: "/icons/favicon-transparent-48.png", type: "image/png", sizes: "48x48" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    },
    appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: "black-translucent" },
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  };
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#101417",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale: requestedLocale } = await params;
  if (!hasLocale(routing.locales, requestedLocale)) notFound();
  const locale = requestedLocale as Locale;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={localeDetails[locale].htmlLang} data-scroll-behavior="smooth">
      <head>
        <link rel="preload" href="/media/game-ui/jade/button-default.png" as="image" />
        <link rel="preload" href="/media/game-ui/jade/button-focused.png" as="image" />
        <link rel="preload" href="/media/game-ui/jade/button-pressed.png" as="image" />
        <link rel="preload" href="/media/game-ui/jade/button-disabled.png" as="image" />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
          <MobileNavigation />
        </NextIntlClientProvider>
        <JadeCursor />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
