import { privatePageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return privatePageMetadata(locale, t("clientTitle"), t("clientDescription"));
}

export default function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
