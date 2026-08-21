import { getTranslations } from "next-intl/server";
import { CharacterShowcase } from "@/components/game/CharacterShowcase";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return pageMetadata({ locale, title: t("charactersPageTitle"), description: t("charactersPageDescription"), path: "/personagens", imageAlt: t("socialAlt") });
}

export default function CharactersPage() {
  return (
    <div className="miraj-page">
      <main className="relative isolate overflow-hidden pt-52 max-[700px]:pt-28">
        <div className="absolute inset-0 -z-30 bg-[url('/media/landing/classes-hall-v1.webp')] bg-cover bg-center" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(8,13,15,.48),rgba(9,14,16,.78)_48%,rgba(9,14,16,.94))]" aria-hidden="true" />
        <SiteHeader />
        <CharacterShowcase />
      </main>
      <SiteFooter />
    </div>
  );
}
