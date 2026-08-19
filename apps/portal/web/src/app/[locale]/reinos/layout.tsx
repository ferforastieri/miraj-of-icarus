import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return pageMetadata({ locale, title: t("realmsTitle"), description: t("realmsDescription"), path: "/reinos", imageAlt: t("socialAlt") });
}

export default function RealmsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
