import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
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
    <div className="min-h-screen overflow-x-hidden bg-[#041d19]">
      <section className="relative isolate grid min-h-[78svh] place-items-center overflow-hidden px-6 pb-20 pt-56 text-center max-[700px]:min-h-[720px] max-[700px]:px-4 max-[700px]:pt-32">
        <div className="absolute inset-0 -z-30 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center max-[700px]:bg-[58%_center]" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(3,25,21,.35),rgba(3,25,21,.88)),radial-gradient(circle_at_50%_38%,rgba(103,205,143,.14),transparent_44%)]" aria-hidden="true" />
        <SiteHeader />
        <div className="w-[min(900px,100%)]">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.25em] text-[#b5e8c8]">{t("kicker")}</p>
          <h1 className="mt-5 font-miraj-of-icarus text-[clamp(3.2rem,7.5vw,7.2rem)] font-semibold leading-[.82] text-[#f5f0dc] [text-shadow:0_4px_16px_#031b16]">{t("title")}</h1>
          <p className="mx-auto mt-8 max-w-3xl text-[clamp(1rem,1.6vw,1.25rem)] leading-8 text-[#e2ebe2]">{t("description")}</p>
          <div className="mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-3 max-[620px]:w-full max-[620px]:flex-col">
            <Link className={buttonStyles("primary", true)} href={routes.classes}>{t("meetClasses")}</Link>
            <Link className={buttonStyles("ghost", true)} href={routes.register}>{t("createAccount")}</Link>
          </div>
        </div>
      </section>

      <main>
        <section className="scroll-mt-28 bg-[linear-gradient(180deg,#eef0df,#f8f1de)] px-6 py-28 text-[#173b32] max-[700px]:px-4 max-[700px]:py-20" id="sobre">
          <div className="mx-auto w-[min(1180px,100%)]">
            <header className="grid grid-cols-[.72fr_1.28fr] gap-14 border-b border-[#9b824c] pb-14 max-[800px]:grid-cols-1 max-[800px]:gap-6">
              <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#8c6c35]">{t("proposalKicker")}</p>
              <h2 className="font-miraj-of-icarus text-[clamp(2.8rem,5vw,5.5rem)] leading-[.88]">{t("proposalTitle")}</h2>
            </header>
            <div className="mt-12 grid grid-cols-3 gap-px bg-[#a38a55] max-[800px]:grid-cols-1">
              {pillars.map(pillar => (
                <article className="scroll-mt-32 min-h-[330px] bg-[#edf0df] p-8 max-[700px]:min-h-0" id={pillar.mark === "II" ? "skills" : undefined} key={pillar.mark}>
                  <span className="font-miraj-of-icarus text-sm text-[#9a793c]">{pillar.mark}</span>
                  <h3 className="mt-16 font-miraj-of-icarus text-4xl leading-none max-[700px]:mt-8">{pillar.title}</h3>
                  <p className="mt-6 leading-7 text-[#536b62]">{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-[#052721] px-6 py-28 text-[#edf1e7] max-[700px]:px-4 max-[700px]:py-20">
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

        <section className="bg-[#e9eddd] px-6 py-24 text-center text-[#173b32] max-[700px]:px-4">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#8c6c35]">{t("firstStepKicker")}</p>
          <h2 className="mx-auto mt-4 max-w-4xl font-miraj-of-icarus text-[clamp(2.8rem,5vw,5.2rem)] leading-[.88]">{t("firstStepTitle")}</h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#526b61]">{t("firstStepText")}</p>
          <Link className={`${buttonStyles("primary", true)} mt-9`} href={routes.classes}>{t("chooseClass")}</Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
