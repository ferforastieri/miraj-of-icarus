import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return pageMetadata({ locale, title: t("communityTitle"), description: t("communityDescription"), path: "/comunidade", index: false, imageAlt: t("socialAlt") });
}

export default async function CommunityPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Community" });
  const futureRooms = [[t("guidesTitle"), t("guidesDescription")], [t("clansTitle"), t("clansDescription")], [t("developmentTitle"), t("developmentDescription")]];
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#041d19]">
      <section className="relative isolate grid min-h-[82svh] place-items-center overflow-hidden px-6 pb-20 pt-56 text-center max-[700px]:min-h-[760px] max-[700px]:px-4 max-[700px]:pt-32">
        <div className="absolute inset-0 -z-30 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center max-[700px]:bg-[61%_center]" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(3,25,21,.48),rgba(3,25,21,.94)),radial-gradient(circle_at_50%_42%,rgba(126,216,161,.16),transparent_42%)]" aria-hidden="true" />
        <SiteHeader />
        <div className="w-[min(920px,100%)]">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.25em] text-[#b5e8c8]">{t("kicker")}</p>
          <h1 className="mt-5 font-miraj-of-icarus text-[clamp(3.1rem,7vw,6.8rem)] font-semibold leading-[.82] text-[#f5f0dc] [text-shadow:0_4px_16px_#031b16]">{t("title")}</h1>
          <p className="mx-auto mt-8 max-w-3xl text-[clamp(1rem,1.6vw,1.22rem)] leading-8 text-[#e2ebe2]">{t("description")}</p>
          <div className="mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-3 max-[620px]:w-full max-[620px]:flex-col">
            <Link className={buttonStyles("primary", true)} href={routes.register}>{t("createAccount")}</Link>
            <Link className={buttonStyles("ghost", true)} href={routes.home}>{t("backHome")}</Link>
          </div>
        </div>
      </section>

      <main className="bg-[linear-gradient(180deg,#eef0df,#f8f1de)] px-6 py-24 text-[#173b32] max-[700px]:px-4 max-[700px]:py-20">
        <section className="mx-auto w-[min(1120px,100%)]">
          <header className="mx-auto max-w-3xl text-center">
            <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#8f6e37]">{t("doorsKicker")}</p>
            <h2 className="mt-4 font-miraj-of-icarus text-[clamp(2.7rem,5vw,5rem)] leading-[.88]">{t("doorsTitle")}</h2>
          </header>
          <div className="mt-14 grid grid-cols-3 gap-px bg-[#a18a58] max-[760px]:grid-cols-1">
            {futureRooms.map(([title, description]) => (
              <article className="min-h-64 bg-[#edf0df] p-8 max-[760px]:min-h-0" key={title}>
                <h3 className="font-miraj-of-icarus text-4xl">{title}</h3>
                <p className="mt-6 leading-7 text-[#536b62]">{description}</p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-2xl text-center leading-7 text-[#65786f]">{t("notice")}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
