import { CommercePage } from "@/components/CommercePage";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return pageMetadata({ locale, title: t("shopTitle"), description: t("shopDescription"), path: "/shop", index: false, imageAlt: t("socialAlt") });
}

export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Commerce" });
  return <CommercePage eyebrow={t("shopEyebrow")} title={t("shopTitle")} description={t("shopDescription")} />;
}
