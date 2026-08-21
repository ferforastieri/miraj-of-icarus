import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PrestigeEvolution } from "@/components/game/PrestigeEvolution";
import { buttonStyles } from "@/components/ui/Button";
import { SectionTitlePlaque } from "@/components/ui/SectionTitlePlaque";
import { WaterSurface } from "@/components/ui/WaterSurface";
import { JsonLd } from "@/components/system/JsonLd";
import { siteConfig } from "@/lib/seo";
import { localeDetails, type Locale } from "@/i18n/routing";
import { routes } from "@/i18n/routing";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  const metadata = await getTranslations({ locale, namespace: "Metadata" });
  const description = metadata("siteDescription");
  const structuredData = [
    { "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: `${siteConfig.url}/${locale}`, description, inLanguage: localeDetails[locale].htmlLang },
    { "@context": "https://schema.org", "@type": "VideoGame", name: siteConfig.name, url: `${siteConfig.url}/${locale}`, image: `${siteConfig.url}${siteConfig.socialImage.url}`, description, genre: ["MMORPG", "Fantasy"], gamePlatform: "PC", operatingSystem: "Windows", playMode: "MultiPlayer", inLanguage: localeDetails[locale].htmlLang },
  ];
  const news = [1, 2, 3].map((item, index) => ({ category: t(`news${item}Category`), title: t(`news${item}Title`), description: t(`news${item}Description`), href: [routes.classes, routes.realms, routes.game][index] }));

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#101417]">
      <JsonLd data={structuredData} />
      <section className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden" id="inicio" aria-labelledby="hero-title">
        <div data-testid="hero-image" className="absolute inset-0 -z-30 animate-hero-arrival bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center max-[700px]:bg-[58%_center]" aria-hidden="true" />
        <WaterSurface />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_43%,rgba(235,255,226,.05)_0_18%,rgba(5,38,31,.12)_44%,rgba(3,24,20,.82)_100%),linear-gradient(180deg,rgba(2,19,16,.2),transparent_35%,rgba(3,24,20,.82)_100%)]" aria-hidden="true" />
        <SiteHeader />

        <div className="relative flex w-[min(920px,calc(100%-32px))] flex-col items-center pb-20 pt-44 text-center max-[700px]:min-h-[100svh] max-[700px]:self-start max-[700px]:justify-between max-[700px]:pb-4 max-[700px]:pt-4">
          <div className="pointer-events-none absolute left-1/2 top-[47%] -z-10 h-[min(720px,78vw)] w-[min(620px,68vw)] -translate-x-1/2 -translate-y-1/2 rounded-[48%_48%_12%_12%] border border-[#a8e5bc]/25 shadow-[inset_0_0_70px_rgba(40,185,111,.14),0_0_80px_rgba(3,24,20,.65)] before:absolute before:inset-5 before:rounded-[48%_48%_12%_12%] before:border before:border-[#d9c788]/30" aria-hidden="true" />
          <p className="mb-2 font-miraj-of-icarus text-[clamp(.7rem,1.3vw,.92rem)] uppercase tracking-[.32em] text-[#b8ecc9] [text-shadow:0_2px_8px_#031b16]">{t("kicker")}</p>
          <Image className="mb-0 h-auto w-[min(730px,92vw)] drop-shadow-[0_14px_22px_rgba(2,20,17,.8)]" src="/media/branding/miraj-of-icarus-wordmark-jade.png" alt="Miraj of Icarus" width={1413} height={673} priority />
          <h1 id="hero-title" className="mt-5 font-miraj-of-icarus text-[clamp(3.1rem,7.8vw,7.3rem)] font-semibold leading-[.8] text-[#f6f1d9] [text-shadow:0_4px_3px_#04271f,0_0_22px_#04271f]">{t("title")}</h1>
          <p className="mt-7 max-w-[650px] text-[clamp(1rem,1.6vw,1.25rem)] leading-8 text-[#f3f5eb] [text-shadow:0_2px_8px_#031b16]">{t("description")}</p>
          <div className="mt-9 grid w-[min(900px,100%)] grid-cols-3 gap-3 max-[760px]:w-full max-[760px]:grid-cols-1">
            <a className={`${buttonStyles("primary", true)} w-full`} style={{ minWidth: 0 }} href="#classes">{t("meetClasses")}</a>
            <Link className={`${buttonStyles("secondary", true)} w-full`} style={{ minWidth: 0 }} href={routes.download}>Download</Link>
            <Link className={`${buttonStyles("ghost", true)} w-full`} style={{ minWidth: 0 }} href={routes.register}>{t("createAccount")}</Link>
          </div>
          <a className="mt-6 hidden place-items-center gap-1 font-miraj-of-icarus text-[.62rem] uppercase tracking-[.2em] text-[#d7e6d7] max-[700px]:grid" href="#classes">
            {t("choosePath")}<span className="text-xl text-[#72d99c]">↓</span>
          </a>
        </div>
        <a className="absolute bottom-6 left-1/2 grid -translate-x-1/2 place-items-center gap-1 font-miraj-of-icarus text-[.62rem] uppercase tracking-[.2em] text-[#d7e6d7] max-[700px]:hidden" href="#classes">
          {t("choosePath")}<span className="text-xl text-[#72d99c]">↓</span>
        </a>
      </section>

      <main>
        <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#101417] px-6 py-[clamp(1rem,3vh,2rem)] max-[700px]:px-4" id="classes">
          <div className="absolute inset-0 -z-20 bg-[url('/media/landing/classes-hall-v1.webp')] bg-[length:100%_100%] bg-center bg-no-repeat max-[700px]:bg-cover" aria-hidden="true" />
          <SectionTitlePlaque
            title={t("charactersTitle")}
            description={t("charactersDescription")}
          />
          <div className="flex flex-1 items-center">
            <PrestigeEvolution />
          </div>
        </section>

        <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[url('/media/landing/news-frontier-v1.webp')] bg-cover bg-center px-6 py-[clamp(1rem,3vh,2rem)] text-[#f2f0e2] max-[700px]:bg-[62%_center] max-[700px]:px-4" id="noticias" aria-labelledby="news-title">
          <div className="mx-auto flex min-h-[calc(100svh-clamp(2rem,6vh,4rem))] w-[min(1200px,100%)] flex-col">
            <SectionTitlePlaque title={t("newsTitle")} titleId="news-title" />
            <div className="mb-[clamp(1rem,3vh,2.5rem)] mt-1 text-center">
              <Link className="text-sm uppercase tracking-[.12em] text-[#e8d795] underline decoration-[#a8e5bc] underline-offset-8" href={routes.community}>{t("followCommunity")}</Link>
            </div>

            <div className="grid flex-1 grid-cols-[1.5fr_.85fr] gap-5 max-[980px]:grid-cols-1">
              {news.map((item, index) => (
                <Link className={`group flex flex-col overflow-hidden border border-[#cdb573]/45 bg-[#111719]/90 shadow-[0_24px_55px_rgba(2,10,12,.35)] ${index === 0 ? "row-span-2 min-h-[660px]" : "min-h-[320px]"} max-[980px]:min-h-[520px]`} href={item.href} key={item.title}>
                  <div className={`relative shrink-0 overflow-hidden ${index === 0 ? "h-[360px]" : "h-[132px]"} max-[980px]:h-[230px]`}>
                    <Image className={`h-full w-full object-cover transition-transform duration-700 group-focus-visible:scale-[1.02] ${index === 1 ? "object-left" : index === 2 ? "object-right" : "object-center"}`} src="/media/landing/news-frontier-v1.webp" alt={t("newsImageAlt")} width={1881} height={836} sizes={index === 0 ? "(max-width: 980px) 100vw, 62vw" : "(max-width: 980px) 100vw, 35vw"} />
                  </div>
                  <article className={`flex flex-1 flex-col text-[#f1f0e2] ${index === 0 ? "p-10" : "p-6"} max-[700px]:p-7`}>
                    <p className="text-[.62rem] uppercase tracking-[.18em] text-[#99deb4]">{item.category}</p>
                    <h3 className={`mt-4 font-miraj-of-icarus leading-tight ${index === 0 ? "text-[clamp(2rem,3vw,3.4rem)]" : "text-[clamp(1.25rem,1.65vw,1.8rem)]"}`}>{item.title}</h3>
                    <p className="mt-5 text-sm leading-6 text-[#c6d4ca]">{item.description}</p>
                    <span className="mt-auto pt-7 text-[.65rem] uppercase tracking-[.12em] text-[#dac17c]">{t("discover")} →</span>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
