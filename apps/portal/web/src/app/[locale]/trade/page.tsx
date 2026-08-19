import { CommerceScreen } from "@/app/[locale]/_components/CommerceScreen";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return pageMetadata({ locale, title: t("tradeTitle"), description: t("tradeDescription"), path: "/trade", index: false, imageAlt: t("socialAlt") });
}

export default async function TradePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Commerce" });
  return <CommerceScreen eyebrow={t("tradeEyebrow")} title={t("tradeTitle")} description={t("tradeDescription")} />;
}
