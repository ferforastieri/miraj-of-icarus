import { AuthScreen } from "@/app/[locale]/_components/AuthScreen";
import { privatePageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return privatePageMetadata(locale, t("registerTitle"), t("registerDescription"));
}

export default function RegisterPage() {
  return <AuthScreen registering />;
}
