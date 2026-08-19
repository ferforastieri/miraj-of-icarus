import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/Button";
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
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#041d19] px-6 py-16 text-center">
      <div className="absolute inset-0 -z-30 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center opacity-25" aria-hidden="true" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(3,25,21,.72),rgba(3,25,21,.97))]" aria-hidden="true" />
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
  );
}
