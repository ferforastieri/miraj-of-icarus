import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PrestigeBadge } from "@/components/PrestigeBadge";
import { buttonStyles } from "@/components/ui/Button";
import { classHref, findGameClass, gameClasses } from "@/domain/game/classes";
import { prestigeTiers } from "@/domain/game/prestige";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return gameClasses.map(gameClass => ({ slug: gameClass.slug }));
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const gameClass = findGameClass(slug);
  if (!gameClass) return {};
  const metadata = await getTranslations({ locale, namespace: "Metadata" });
  const t = await getTranslations({ locale, namespace: "Classes" });
  const name = t(`items.${gameClass.id}.name`);
  return pageMetadata({
    locale,
    title: metadata("classTitle", { name }),
    description: metadata("classDescription", { name, epithet: t(`items.${gameClass.id}.epithet`), summary: t(`items.${gameClass.id}.summary`) }),
    path: `/classes/${gameClass.slug}`,
    imageAlt: metadata("socialAlt"),
  });
}

export default async function ClassPage({ params }: Props) {
  const { locale, slug } = await params;
  const gameClass = findGameClass(slug);
  if (!gameClass) notFound();
  const t = await getTranslations({ locale, namespace: "Classes" });
  const prestigeT = await getTranslations({ locale, namespace: "Prestige" });
  const field = (id: typeof gameClass.id, key: string) => t(`items.${id}.${key}`);

  const index = gameClasses.findIndex(item => item.id === gameClass.id);
  const previous = gameClasses[(index - 1 + gameClasses.length) % gameClasses.length];
  const next = gameClasses[(index + 1) % gameClasses.length];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#041d19]">
      <section className="relative isolate min-h-[900px] overflow-hidden px-6 pb-24 pt-52 max-[700px]:min-h-0 max-[700px]:px-4 max-[700px]:pb-20 max-[700px]:pt-32">
        <div className="absolute inset-0 -z-30 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center opacity-50" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_44%,rgba(47,162,102,.19),transparent_31%),linear-gradient(90deg,#031b17_0_35%,rgba(3,27,23,.72)_62%,#031b17_100%)]" aria-hidden="true" />
        <SiteHeader />
        <div className="mx-auto grid w-[min(1180px,100%)] grid-cols-[.9fr_1.1fr] items-center gap-12 max-[850px]:grid-cols-1 max-[850px]:text-center">
          <div>
            <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#8ee5b0]">{t("path")} · {field(gameClass.id, "role")}</p>
            <h1 className="my-5 font-miraj-of-icarus text-[clamp(4.5rem,10vw,9rem)] font-semibold leading-[.72] text-[#f6f1de] [text-shadow:0_4px_18px_#021511] max-[500px]:text-[3.25rem]">{field(gameClass.id, "name")}</h1>
            <p className="font-miraj-of-icarus text-[clamp(1.3rem,2.5vw,2rem)] text-[#d6bc7d]">{field(gameClass.id, "epithet")}</p>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#d7e3d8] max-[850px]:mx-auto">{field(gameClass.id, "summary")}</p>
            <div className="mt-9 flex gap-3 max-[850px]:justify-center max-[520px]:flex-col">
              <Link className={buttonStyles("primary", true)} href={routes.register}>{t("choose")}</Link>
              <Link className={buttonStyles("ghost", true)} href={routes.classes}>{t("viewAll")}</Link>
            </div>
          </div>
          <div className="relative grid min-h-[580px] place-items-center max-[700px]:min-h-[390px]">
            <div className="absolute size-[72%] rotate-45 border border-[#a9dcb9]/20 bg-[#0c4b3c]/16 shadow-[0_0_65px_rgba(40,185,111,.18)]" aria-hidden="true" />
            <PrestigeBadge classId={gameClass.id} className="relative w-[min(540px,88vw)] drop-shadow-[0_30px_35px_rgba(1,13,11,.75)]" level={110} selected priority />
          </div>
        </div>
      </section>

      <main>
        <section className="bg-[linear-gradient(180deg,#e9ecdc,#f7f0dd)] px-6 py-28 text-[#183b32] max-[700px]:px-4 max-[700px]:py-20">
          <div className="mx-auto grid w-[min(1100px,100%)] grid-cols-[.9fr_1.1fr] gap-20 max-[850px]:grid-cols-1 max-[850px]:gap-12">
            <div>
              <p className="font-miraj-of-icarus text-xs uppercase tracking-[.2em] text-[#8d6c32]">{t("identity")}</p>
              <h2 className="mt-5 font-miraj-of-icarus text-[clamp(3rem,5vw,5.2rem)] leading-[.86]">{t("following")}</h2>
              <p className="mt-7 text-lg leading-8 text-[#526b61]">{field(gameClass.id, "calling")}</p>
            </div>
            <dl className="grid grid-cols-2 border-y border-[#9a804a] bg-[#f2eedc] max-[520px]:grid-cols-1">
              {[[t("role"), field(gameClass.id, "role")], [t("range"), field(gameClass.id, "range")], [t("rhythm"), field(gameClass.id, "rhythm")], [t("specialty"), field(gameClass.id, "specialty")]].map(([term, value]) => (
                <div className="border-b border-r border-[#b9aa7d] px-7 py-8 last:border-b-0" key={term}>
                  <dt className="text-[.65rem] uppercase tracking-[.18em] text-[#8f743d]">{term}</dt>
                  <dd className="mt-2 font-miraj-of-icarus text-2xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-[#052720] px-6 py-28 text-center max-[700px]:px-4 max-[700px]:py-20">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#92e5b2]">{t("crestRise")}</p>
          <h2 className="mx-auto mt-5 max-w-4xl font-miraj-of-icarus text-[clamp(3.2rem,6vw,6rem)] leading-[.84] text-[#f4efdc]">{t("achievements")}</h2>
          <div className="mx-auto mt-16 grid w-[min(1220px,100%)] grid-cols-4 gap-3 max-[950px]:grid-cols-3 max-[700px]:grid-cols-2 max-[430px]:grid-cols-1">
            {prestigeTiers.map(tier => (
              <article className="border-y border-[#8e7848] bg-[#072f28] px-4 pb-7 pt-3" key={tier.id}>
                <PrestigeBadge classId={gameClass.id} className="mx-auto size-52" level={tier.level} />
                <h3 className="font-miraj-of-icarus text-3xl text-[#f1ebda]">{prestigeT(`tiers.${tier.id}.name`)}</h3>
                <p className="mt-2 text-sm text-[#aacab7]">{t("level", { level: tier.level })} · {prestigeT(`tiers.${tier.id}.stage`)}</p>
              </article>
            ))}
          </div>
        </section>

        <nav className="grid grid-cols-2 bg-[#eee9d8] text-[#173a31]" aria-label={t("otherAria")}>
          <Link className="border-r border-[#9c8755] px-8 py-12 text-left focus-visible:bg-[#dce8d9] max-[600px]:px-4" href={classHref(previous)}><span className="text-xs uppercase tracking-[.16em] text-[#8c733e]">← {t("previous")}</span><strong className="mt-2 block font-miraj-of-icarus text-[clamp(1.8rem,4vw,3.5rem)]">{field(previous.id, "name")}</strong></Link>
          <Link className="px-8 py-12 text-right focus-visible:bg-[#dce8d9] max-[600px]:px-4" href={classHref(next)}><span className="text-xs uppercase tracking-[.16em] text-[#8c733e]">{t("next")} →</span><strong className="mt-2 block font-miraj-of-icarus text-[clamp(1.8rem,4vw,3.5rem)]">{field(next.id, "name")}</strong></Link>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
