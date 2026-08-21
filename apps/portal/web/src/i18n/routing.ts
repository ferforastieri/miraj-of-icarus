import { defineRouting } from "next-intl/routing";

export const routes = {
  home: "/",
  login: "/entrar",
  register: "/criar-conta",
  client: "/cliente",
  panel: "/painel",
  game: "/o-jogo",
  gameAbout: { pathname: "/o-jogo", hash: "sobre" },
  skills: "/skills",
  community: "/comunidade",
  reconstruction: { pathname: "/", hash: "reconstrucao" },
  realms: "/reinos",
  download: "/download",
  trade: "/trade",
  shop: "/shop",
  classes: "/personagens",
  prestige: { pathname: "/", hash: "prestigio" },
  offline: "/offline",
  class: "/classes/[slug]",
} as const;

export const pathnames = {
  "/": "/",
  "/entrar": { pt: "/entrar", en: "/sign-in", es: "/iniciar-sesion" },
  "/criar-conta": { pt: "/criar-conta", en: "/create-account", es: "/crear-cuenta" },
  "/cliente": { pt: "/conta", en: "/account", es: "/cuenta" },
  "/painel": { pt: "/administracao", en: "/admin", es: "/administracion" },
  "/o-jogo": { pt: "/o-jogo", en: "/the-game", es: "/el-juego" },
  "/personagens": { pt: "/personagens", en: "/characters", es: "/personajes" },
  "/skills": "/skills",
  "/comunidade": { pt: "/comunidade", en: "/community", es: "/comunidad" },
  "/reinos": { pt: "/reinos", en: "/realms", es: "/reinos" },
  "/download": "/download",
  "/trade": { pt: "/trocas", en: "/trade", es: "/intercambios" },
  "/shop": { pt: "/loja", en: "/shop", es: "/tienda" },
  "/offline": { pt: "/sem-conexao", en: "/offline", es: "/sin-conexion" },
  "/classes/[slug]": { pt: "/classes/[slug]", en: "/classes/[slug]", es: "/clases/[slug]" },
} as const;

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
  pathnames,
});

export type Locale = (typeof routing.locales)[number];

export const localeDetails: Record<Locale, { countryCode: string; label: string; htmlLang: string }> = {
  pt: { countryCode: "BR", label: "Brasil", htmlLang: "pt-BR" },
  en: { countryCode: "US", label: "United States", htmlLang: "en-US" },
  es: { countryCode: "ES", label: "España", htmlLang: "es-ES" },
};
