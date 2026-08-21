import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PrestigeBadge } from "@/components/game/PrestigeBadge";
import { ClassCrestEvolution } from "@/components/game/ClassCrestEvolution";
import { buttonStyles } from "@/components/ui/Button";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";
import { classHref, gameClassIds } from "@/components/game/model";
import { pageMetadata } from "@/lib/seo";
import { routes, routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

export async function generateStaticParams() {
  const slugs = await Promise.all(routing.locales.map(async locale => {
    const t = await getTranslations({ locale, namespace: "Classes" });
    return gameClassIds.map(classId => t(`slugs.${classId}`));
  }));
  return [...new Set(slugs.flat())].map(slug => ({ slug }));
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const metadata = await getTranslations({ locale, namespace: "Metadata" });
  const t = await getTranslations({ locale, namespace: "Classes" });
  const gameClass = gameClassIds.map(id => ({ id, slug: t(`slugs.${id}`) })).find(item => item.slug === slug);
  if (!gameClass) return {};
  const localizedSlugs = Object.fromEntries(await Promise.all(routing.locales.map(async item => {
    const translations = await getTranslations({ locale: item, namespace: "Classes" });
    return [item, translations(`slugs.${gameClass.id}`)] as const;
  }))) as Record<Locale, string>;
  const name = t(`items.${gameClass.id}.name`);
  return pageMetadata({
    locale,
    title: metadata("classTitle", { name }),
    description: metadata("classDescription", { name, epithet: t(`items.${gameClass.id}.epithet`), summary: t(`items.${gameClass.id}.summary`) }),
    path: item => classHref(localizedSlugs[item]),
    imageAlt: metadata("socialAlt"),
  });
}

export default async function ClassPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Classes" });
  const gameClasses = gameClassIds.map(id => ({ id, slug: t(`slugs.${id}`) }));
  const gameClass = gameClasses.find(item => item.slug === slug);
  if (!gameClass) notFound();
  const field = (id: typeof gameClass.id, key: string) => t(`items.${id}.${key}`);

  const index = gameClasses.findIndex(item => item.id === gameClass.id);
  const previous = gameClasses[(index - 1 + gameClasses.length) % gameClasses.length];
  const next = gameClasses[(index + 1) % gameClasses.length];

  return (
    <div className="miraj-page">
      <section className="miraj-page-hero px-6 pb-12 pt-52 max-[700px]:px-4 max-[700px]:pt-28">
        <WaterBackdrop />
        <SiteHeader />
        <div className="mx-auto grid w-[min(1180px,100%)] grid-cols-[.9fr_1.1fr] items-center gap-12 max-[850px]:grid-cols-1 max-[850px]:text-center">
          <div>
            <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#8ee5b0]">{t("path")} · {field(gameClass.id, "role")}</p>
            <h1 className="miraj-page-heading my-5">{field(gameClass.id, "name")}</h1>
            <p className="font-miraj-of-icarus text-[clamp(1.3rem,2.5vw,2rem)] text-[#d6bc7d]">{field(gameClass.id, "epithet")}</p>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#d7e3d8] max-[850px]:mx-auto">{field(gameClass.id, "summary")}</p>
            <div className="mt-9 flex gap-3 max-[850px]:justify-center max-[520px]:flex-col">
              <Link className={buttonStyles("primary", true)} href={routes.register}>{t("choose")}</Link>
              <Link className={buttonStyles("ghost", true)} href={routes.classes}>{t("viewAll")}</Link>
            </div>
          </div>
          <div className="relative grid min-h-[400px] place-items-center max-[700px]:min-h-[320px]">
            <div className="absolute size-[72%] rotate-45 border border-[#a9dcb9]/20 bg-[#0c4b3c]/16 shadow-[0_0_65px_rgba(40,185,111,.18)]" aria-hidden="true" />
            <PrestigeBadge classId={gameClass.id} className="relative w-[min(540px,88vw)] drop-shadow-[0_30px_35px_rgba(1,13,11,.75)]" level={110} selected priority />
          </div>
        </div>
      </section>

      <main>
        <section className="miraj-dark-section miraj-scene-classes px-6 py-20 max-[700px]:px-4 max-[700px]:py-14">
          <div className="mx-auto grid w-[min(1100px,100%)] grid-cols-[.9fr_1.1fr] gap-20 max-[850px]:grid-cols-1 max-[850px]:gap-12">
            <div>
              <p className="font-miraj-of-icarus text-xs uppercase tracking-[.2em] text-[#92dfaf]">{t("identity")}</p>
              <h2 className="mt-5 font-miraj-of-icarus text-[clamp(3rem,5vw,5.2rem)] leading-[.86]">{t("following")}</h2>
              <p className="mt-7 text-lg leading-8 text-[#bccdc2]">{field(gameClass.id, "calling")}</p>
            </div>
            <dl className="miraj-glass-card grid grid-cols-2 max-[520px]:grid-cols-1">
              {[[t("role"), field(gameClass.id, "role")], [t("range"), field(gameClass.id, "range")], [t("rhythm"), field(gameClass.id, "rhythm")], [t("specialty"), field(gameClass.id, "specialty")]].map(([term, value]) => (
                <div className="border-b border-r border-[#b9aa7d] px-7 py-8 last:border-b-0" key={term}>
                  <dt className="text-[.65rem] uppercase tracking-[.18em] text-[#d6bd78]">{term}</dt>
                  <dd className="mt-2 font-miraj-of-icarus text-2xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="miraj-dark-section px-6 py-16 text-center max-[700px]:px-4 max-[700px]:py-12">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#92e5b2]">{t("crestRise")}</p>
          <h2 className="mx-auto mt-4 max-w-4xl font-miraj-of-icarus text-[clamp(2.7rem,5vw,5rem)] leading-[.86] text-[#f4efdc]">{t("achievements")}</h2>
          <ClassCrestEvolution classId={gameClass.id} />
        </section>

        <nav className="grid grid-cols-2 border-y border-[#9c8755] bg-[linear-gradient(rgba(9,13,15,.72),rgba(9,13,15,.82)),url('/media/portal-hero-v3.png')] bg-cover bg-center text-[#edf1e7]" aria-label={t("otherAria")}>
          <Link className="border-r border-[#9c8755] px-8 py-12 text-left focus-visible:bg-black/20 max-[600px]:px-4" href={classHref(previous.slug)}><span className="text-xs uppercase tracking-[.16em] text-[#d6bd78]">← {t("previous")}</span><strong className="mt-2 block font-miraj-of-icarus text-[clamp(1.8rem,4vw,3.5rem)]">{field(previous.id, "name")}</strong></Link>
          <Link className="px-8 py-12 text-right focus-visible:bg-black/20 max-[600px]:px-4" href={classHref(next.slug)}><span className="text-xs uppercase tracking-[.16em] text-[#d6bd78]">{t("next")} →</span><strong className="mt-2 block font-miraj-of-icarus text-[clamp(1.8rem,4vw,3.5rem)]">{field(next.id, "name")}</strong></Link>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
