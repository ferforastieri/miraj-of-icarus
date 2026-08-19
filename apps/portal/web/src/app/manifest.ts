import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${siteConfig.name} - Portal oficial`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#041d19",
    theme_color: "#041d19",
    orientation: "any",
    lang: "pt-BR",
    categories: ["games", "entertainment"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Minha conta", short_name: "Conta", url: "/cliente", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Reinos", short_name: "Reinos", url: "/reinos", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Administração", short_name: "Admin", url: "/painel", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
