import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/ibm-plex-sans-condensed/400.css";
import "@fontsource/ibm-plex-sans-condensed/500.css";
import "@fontsource/ibm-plex-sans-condensed/600.css";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Masicarus — A passagem está aberta",
    template: "%s | Masicarus",
  },
  description:
    "Portal oficial do Masicarus. Baixe o launcher, acompanhe os reinos e gerencie sua conta.",
  metadataBase: new URL("https://masicarus.com.br"),
  alternates: { canonical: "/" },
  icons: { icon: "/media/mark.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body><QueryProvider>{children}</QueryProvider></body>
    </html>
  );
}
