"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useGameServers } from "@/app/api/_react-query/game-servers/get-game-servers";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";
import { routes } from "@/i18n/routing";

export default function RealmsPage() {
  const t = useTranslations("Realms");
  const realmSystems = ["clans", "wars", "territories"].map(item => ({ title: t(`${item}Title`), subtitle: t(`${item}Subtitle`), description: t(`${item}Description`) }));
  const servers = useGameServers();

  return (
    <div className="miraj-page">
      <section className="miraj-page-hero px-6 pb-12 pt-52 text-center max-[700px]:px-4 max-[700px]:pt-28">
        <WaterBackdrop imagePosition="bg-center max-[700px]:bg-[63%_center]" />
        <SiteHeader />
        <div className="w-[min(920px,100%)]">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.25em] text-[#b5e8c8]">{t("kicker")}</p>
          <h1 className="miraj-page-heading mt-5">{t("title")}</h1>
          <p className="mx-auto mt-8 max-w-3xl text-[clamp(1rem,1.6vw,1.25rem)] leading-8 text-[#e2ebe2]">{t("description")}</p>
          <a className={`${buttonStyles("primary", true)} mt-9`} href="#reinos-disponiveis">{t("view")}</a>
        </div>
      </section>

      <main>
        <section className="miraj-dark-section miraj-scene-citadel miraj-section-frame px-6 max-[700px]:px-4" id="reinos-disponiveis">
          <div className="mx-auto w-[min(1120px,100%)]">
            <header className="grid grid-cols-[.6fr_1.4fr] gap-12 border-b border-[#9c824d] pb-12 max-[760px]:grid-cols-1 max-[760px]:gap-4">
              <p className="font-miraj-of-icarus text-xs uppercase tracking-[.2em] text-[#92dfaf]">{t("availableKicker")}</p>
              <h2 className="font-miraj-of-icarus text-[clamp(2.7rem,5vw,5rem)] leading-[.88]">{t("availableTitle")}</h2>
            </header>
            <div className="mt-10 grid gap-3">
              {servers.data?.map(server => (
                <article className="miraj-glass-card grid min-h-32 grid-cols-[1fr_auto] items-center px-8 py-6 max-[560px]:grid-cols-1 max-[560px]:gap-4 max-[560px]:px-5" key={server.id}>
                  <div>
                    <p className="font-miraj-of-icarus text-[.62rem] uppercase tracking-[.2em] text-[#d6bd78]">{server.region}</p>
                    <h3 className="mt-2 font-miraj-of-icarus text-4xl">{server.name}</h3>
                    {!server.available && server.maintenanceMessage && <p className="mt-2 text-sm text-[#bccdc2]">{server.maintenanceMessage}</p>}
                  </div>
                  <span className={`font-miraj-of-icarus text-sm uppercase tracking-[.14em] ${server.available ? "text-[#82e0a8]" : "text-[#d6a58f]"}`}>{t(server.available ? "available" : "maintenance")}</span>
                </article>
              ))}
              {servers.isLoading && <p className="border-y border-[#a58a52] py-12 text-center text-[#5e7168]">{t("loading")}</p>}
              {!servers.isLoading && !servers.data?.length && <p className="border-y border-[#a58a52] py-12 text-center text-[#5e7168]">{t("empty")}</p>}
            </div>
          </div>
        </section>

        <section className="miraj-dark-section miraj-section-frame relative isolate overflow-hidden px-6 text-[#eef1e7] max-[700px]:px-4">
          <div className="absolute inset-0 -z-20 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center opacity-[.1]" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,29,24,.96),rgba(7,52,43,.9),rgba(3,29,24,.96))]" aria-hidden="true" />
          <div className="mx-auto w-[min(1180px,100%)]">
            <header className="mx-auto max-w-4xl text-center">
              <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#92dfaf]">{t("systemsKicker")}</p>
              <h2 className="mt-4 font-miraj-of-icarus text-[clamp(2.8rem,5.5vw,5.5rem)] leading-[.88] text-[#f4efdc]">{t("systemsTitle")}</h2>
              <p className="mx-auto mt-7 max-w-2xl leading-7 text-[#bfcfc4]">{t("systemsText")}</p>
            </header>
            <div className="relative mt-16 grid grid-cols-3 gap-8 before:absolute before:left-[12%] before:right-[12%] before:top-5 before:h-px before:bg-[#b59a5c] max-[760px]:grid-cols-1 max-[760px]:before:bottom-[12%] max-[760px]:before:left-5 max-[760px]:before:right-auto max-[760px]:before:top-[12%] max-[760px]:before:h-auto max-[760px]:before:w-px">
              {realmSystems.map((system, index) => (
                <article className="miraj-glass-card relative z-10 px-7 pb-8 pt-14" key={system.title}>
                  <span className="absolute left-1/2 top-0 grid size-10 -translate-x-1/2 -translate-y-1/2 rotate-45 place-items-center border border-[#ddc57d] bg-[#116640] shadow-[0_0_15px_rgba(66,190,119,.45)]"><b className="-rotate-45 font-miraj-of-icarus text-xs">{index + 1}</b></span>
                  <p className="font-miraj-of-icarus text-[.62rem] uppercase tracking-[.18em] text-[#8adbaa]">{system.subtitle}</p>
                  <h3 className="mt-4 font-miraj-of-icarus text-4xl text-[#ead99e]">{system.title}</h3>
                  <p className="mt-5 leading-7 text-[#bccdc2]">{system.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-14 text-center">
              <Link className={buttonStyles("primary", true)} href={routes.community}>{t("followCommunity")}</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
