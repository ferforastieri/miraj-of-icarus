import type { Metadata } from "next";
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
  icons: { icon: "/media/branding/masicarus-feather-mark.png" },
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
