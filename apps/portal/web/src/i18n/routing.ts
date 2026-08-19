import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
  localePrefix: "always",
  localeCookie: {
    name: "MIRAJ_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

export const localeDetails: Record<Locale, { countryCode: string; label: string; htmlLang: string }> = {
  pt: { countryCode: "BR", label: "Brasil", htmlLang: "pt-BR" },
  en: { countryCode: "US", label: "United States", htmlLang: "en-US" },
  es: { countryCode: "ES", label: "España", htmlLang: "es-ES" },
};
