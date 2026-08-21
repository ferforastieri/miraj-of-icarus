import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PrestigeBadge } from "@/components/game/PrestigeBadge";
import { classHref, gameClassIds } from "@/components/game/model";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return pageMetadata({ locale, title: t("skillsPageTitle"), description: t("skillsPageDescription"), path: "/skills", imageAlt: t("socialAlt") });
}

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;
  const metadata = await getTranslations({ locale, namespace: "Metadata" });
  const classes = await getTranslations({ locale, namespace: "Classes" });
  const navigation = await getTranslations({ locale, namespace: "Navigation" });

  return (
    <div className="miraj-page">
      <section className="miraj-page-hero px-6 pb-12 pt-52 text-center max-[700px]:px-4 max-[700px]:pt-28">
        <WaterBackdrop imagePosition="bg-center max-[700px]:bg-[60%_center]" />
        <SiteHeader />
        <div className="w-[min(820px,100%)]">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.24em] text-[#a9e9c4]">{navigation("skills")}</p>
          <h1 className="miraj-page-heading mt-4">{metadata("skillsPageTitle")}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#d6e1d9]">{metadata("skillsPageDescription")}</p>
        </div>
      </section>

      <main className="miraj-dark-section miraj-scene-classes px-6 py-20 max-[700px]:px-4 max-[700px]:py-14">
        <div className="mx-auto grid w-[min(1220px,100%)] grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1">
          {gameClassIds.map(classId => (
            <Link className="miraj-glass-card group flex min-h-[360px] flex-col p-6 text-center" href={classHref(classes(`slugs.${classId}`))} key={classId}>
              <PrestigeBadge classId={classId} className="mx-auto size-36 transition-transform duration-500 group-hover:scale-105" level={30} selected />
              <h2 className="mt-3 font-miraj-of-icarus text-3xl text-[#f4efdc]">{classes(`items.${classId}.name`)}</h2>
              <p className="mt-2 text-xs uppercase tracking-[.14em] text-[#d6bd78]">{classes(`items.${classId}.role`)}</p>
              <dl className="mt-5 grid gap-2 border-t border-[#a58a52]/45 pt-4 text-left text-sm">
                <div><dt className="text-[#91d8ad]">{classes("range")}</dt><dd className="text-[#d4dfd7]">{classes(`items.${classId}.range`)}</dd></div>
                <div><dt className="text-[#91d8ad]">{classes("rhythm")}</dt><dd className="text-[#d4dfd7]">{classes(`items.${classId}.rhythm`)}</dd></div>
                <div><dt className="text-[#91d8ad]">{classes("specialty")}</dt><dd className="text-[#d4dfd7]">{classes(`items.${classId}.specialty`)}</dd></div>
              </dl>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
