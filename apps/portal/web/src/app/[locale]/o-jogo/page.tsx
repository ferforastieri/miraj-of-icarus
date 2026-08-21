import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return pageMetadata({ locale, title: t("gameTitle"), description: t("gameDescription"), path: "/o-jogo", imageAlt: t("socialAlt") });
}

export default async function GamePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Game" });
  const pillars = [1, 2, 3].map((item, index) => ({ mark: ["I", "II", "III"][index], title: t(`pillar${item}Title`), text: t(`pillar${item}Text`) }));
  const reconstruction = [[t("accessTitle"), t("accessText")], [t("charactersTitle"), t("charactersText")], [t("worldTitle"), t("worldText")]];
  return (
    <div className="miraj-page">
      <section className="miraj-page-hero px-6 pb-12 pt-52 text-center max-[700px]:px-4 max-[700px]:pt-28">
        <WaterBackdrop imagePosition="bg-center max-[700px]:bg-[58%_center]" />
        <SiteHeader />
        <div className="w-[min(900px,100%)]">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.25em] text-[#b5e8c8]">{t("kicker")}</p>
          <h1 className="miraj-page-heading mt-5">{t("title")}</h1>
          <p className="mx-auto mt-8 max-w-3xl text-[clamp(1rem,1.6vw,1.25rem)] leading-8 text-[#e2ebe2]">{t("description")}</p>
          <div className="mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-3 max-[620px]:w-full max-[620px]:flex-col">
            <Link className={buttonStyles("primary", true)} href={routes.classes}>{t("meetClasses")}</Link>
            <Link className={buttonStyles("ghost", true)} href={routes.register}>{t("createAccount")}</Link>
          </div>
        </div>
      </section>

      <main>
        <section className="miraj-dark-section miraj-scene-classes miraj-section-frame scroll-mt-28 px-6 max-[700px]:px-4" id="sobre">
          <div className="mx-auto w-[min(1180px,100%)]">
            <header className="grid grid-cols-[.72fr_1.28fr] gap-14 border-b border-[#9b824c] pb-14 max-[800px]:grid-cols-1 max-[800px]:gap-6">
              <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#92dfaf]">{t("proposalKicker")}</p>
              <h2 className="font-miraj-of-icarus text-[clamp(2.8rem,5vw,5.5rem)] leading-[.88]">{t("proposalTitle")}</h2>
            </header>
            <div className="mt-12 grid grid-cols-3 gap-3 max-[800px]:grid-cols-1">
              {pillars.map(pillar => (
                <article className="miraj-glass-card scroll-mt-32 min-h-[330px] p-8 max-[700px]:min-h-0" id={pillar.mark === "II" ? "skills" : undefined} key={pillar.mark}>
                  <span className="font-miraj-of-icarus text-sm text-[#d6bd78]">{pillar.mark}</span>
                  <h3 className="mt-16 font-miraj-of-icarus text-4xl leading-none max-[700px]:mt-8">{pillar.title}</h3>
                  <p className="mt-6 leading-7 text-[#bccdc2]">{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="miraj-dark-section miraj-section-frame relative isolate overflow-hidden px-6 text-[#edf1e7] max-[700px]:px-4">
          <div className="absolute inset-0 -z-20 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center opacity-[.12]" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_28%_45%,rgba(39,145,92,.22),rgba(3,27,23,.96)_58%)]" aria-hidden="true" />
          <div className="mx-auto grid w-[min(1180px,100%)] grid-cols-[.92fr_1.08fr] items-center gap-16 max-[900px]:grid-cols-1">
            <div className="relative">
              <Image className="h-auto w-full border-y border-[#a48a51] object-cover shadow-[0_28px_65px_rgba(1,15,12,.45)]" src="/media/portal-hero-v3.png" alt={t("imageAlt")} width={1536} height={1024} />
              <span className="absolute inset-5 border border-[#e9d9a0]/35" aria-hidden="true" />
            </div>
            <div>
              <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#89dbaa]">{t("reconstructionKicker")}</p>
              <h2 className="mt-5 font-miraj-of-icarus text-[clamp(2.8rem,5vw,5rem)] leading-[.88] text-[#f4efdc]">{t("reconstructionTitle")}</h2>
              <div className="mt-10 grid gap-7">
                {reconstruction.map(([title, text]) => (
                  <article className="border-l border-[#b49a5d] pl-6" key={title}>
                    <h3 className="font-miraj-of-icarus text-2xl text-[#e5cd8a]">{title}</h3>
                    <p className="mt-2 leading-7 text-[#bccdc2]">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="miraj-dark-section miraj-scene-citadel miraj-section-frame px-6 text-center max-[700px]:px-4">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#92dfaf]">{t("firstStepKicker")}</p>
          <h2 className="mx-auto mt-4 max-w-4xl font-miraj-of-icarus text-[clamp(2.8rem,5vw,5.2rem)] leading-[.88]">{t("firstStepTitle")}</h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#bccdc2]">{t("firstStepText")}</p>
          <Link className={`${buttonStyles("primary", true)} mt-9`} href={routes.classes}>{t("chooseClass")}</Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
