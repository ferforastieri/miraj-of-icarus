import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Masicarus — Uma nova era",
    template: "%s | Masicarus",
  },
  description:
    "Portal oficial do Masicarus, um mundo online sendo reconstruído sobre uma plataforma moderna.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
