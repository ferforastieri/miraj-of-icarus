import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Miraj of Icarus — A passagem está aberta",
    template: "%s | Miraj of Icarus",
  },
  description:
    "Portal oficial de Miraj of Icarus. Baixe o launcher, acompanhe os reinos e gerencie sua conta.",
  metadataBase: new URL("https://mirajoficarus.com.br"),
  alternates: { canonical: "/" },
  icons: { icon: "/media/branding/miraj-mj-mark.png" },
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
