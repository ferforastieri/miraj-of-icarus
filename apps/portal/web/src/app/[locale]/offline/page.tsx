import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/Button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";
import { privatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return privatePageMetadata(locale, t("offlineTitle"), t("offlineDescription"));
}

export default async function OfflinePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Offline" });
  return (
    <div className="miraj-page">
      <main className="miraj-page-hero px-6 pb-16 pt-36 text-center">
        <WaterBackdrop subtle />
        <SiteHeader />
        <section className="flex w-[min(720px,100%)] flex-col items-center">
        <Image
          className="mb-8 h-40 w-40 object-contain drop-shadow-[0_0_28px_rgba(40,185,111,.35)]"
          src="/media/branding/miraj-mj-mark-jade.png"
          alt=""
          width={1052}
          height={1167}
          priority
        />
        <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#9be4b7]">{t("kicker")}</p>
        <h1 className="mt-5 font-miraj-of-icarus text-[clamp(3rem,8vw,6.5rem)] leading-[.86] text-[#f4efdc]">{t("title")}</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-[#c4d4c9]">{t("description")}</p>
        <Link className={`${buttonStyles("primary", true)} mt-10`} href="/">{t("retry")}</Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
