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
  return pageMetadata({ locale, title: t("communityTitle"), description: t("communityDescription"), path: "/comunidade", index: false, imageAlt: t("socialAlt") });
}

export default async function CommunityPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Community" });
  const futureRooms = [[t("guidesTitle"), t("guidesDescription")], [t("clansTitle"), t("clansDescription")], [t("developmentTitle"), t("developmentDescription")]];
  return (
    <div className="miraj-page">
      <section className="miraj-page-hero px-6 pb-12 pt-52 text-center max-[700px]:px-4 max-[700px]:pt-28">
        <WaterBackdrop imagePosition="bg-center max-[700px]:bg-[61%_center]" />
        <SiteHeader />
        <div className="w-[min(920px,100%)]">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.25em] text-[#b5e8c8]">{t("kicker")}</p>
          <h1 className="miraj-page-heading mt-5">{t("title")}</h1>
          <p className="mx-auto mt-8 max-w-3xl text-[clamp(1rem,1.6vw,1.22rem)] leading-8 text-[#e2ebe2]">{t("description")}</p>
          <div className="mx-auto mt-10 grid w-full max-w-[620px] grid-cols-2 gap-3 max-[700px]:grid-cols-1">
            <Link className={`${buttonStyles("primary", true)} w-full !min-w-0`} href={routes.register}>{t("createAccount")}</Link>
            <Link className={`${buttonStyles("ghost", true)} w-full !min-w-0`} href={routes.home}>{t("backHome")}</Link>
          </div>
        </div>
      </section>

      <main className="miraj-dark-section miraj-scene-classes px-6 py-20 max-[700px]:px-4 max-[700px]:py-14">
        <section className="mx-auto w-[min(1120px,100%)]">
          <header className="mx-auto max-w-3xl text-center">
            <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#92dfaf]">{t("doorsKicker")}</p>
            <h2 className="mt-4 font-miraj-of-icarus text-[clamp(2.7rem,5vw,5rem)] leading-[.88]">{t("doorsTitle")}</h2>
          </header>
          <div className="mt-10 grid grid-cols-3 items-stretch gap-4 max-[760px]:grid-cols-1">
            {futureRooms.map(([title, description]) => (
              <article className="miraj-glass-card min-h-64 p-8 max-[760px]:min-h-0" key={title}>
                <h3 className="font-miraj-of-icarus text-4xl">{title}</h3>
                <p className="mt-6 leading-7 text-[#bccdc2]">{description}</p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-2xl text-center leading-7 text-[#aacab7]">{t("notice")}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
