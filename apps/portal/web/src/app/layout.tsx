import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import { JadeCursor } from "@/components/ui/JadeCursor";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { pageMetadata, siteConfig } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Miraj of Icarus - O céu não é o limite",
    description: siteConfig.description,
    path: "/",
    absoluteTitle: true,
  }),
  title: {
    default: "Miraj of Icarus - O céu não é o limite",
    template: "%s | Miraj of Icarus",
  },
  metadataBase: new URL("https://mirajoficarus.com"),
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "games",
  manifest: "/manifest.webmanifest",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [
      { url: "/icons/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "black-translucent",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#041d19",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <link rel="preload" href="/media/game-ui/jade/button-default.png" as="image" />
        <link rel="preload" href="/media/game-ui/jade/button-focused.png" as="image" />
        <link rel="preload" href="/media/game-ui/jade/button-pressed.png" as="image" />
        <link rel="preload" href="/media/game-ui/jade/button-disabled.png" as="image" />
      </head>
      <body>
        <QueryProvider>{children}</QueryProvider>
        <JadeCursor />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
