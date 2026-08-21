"use client";

import { useAccount } from "@/app/api/_react-query/authentication/get-account";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { routes } from "@/i18n/routing";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";

export function AuthScreen({ registering }: { registering: boolean }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const account = useAccount();
  useEffect(() => {
    if (account.data) router.replace(routes.client);
  }, [account.data, router]);
  return (
    <div className="miraj-page relative isolate">
      <WaterBackdrop fixed />
      <SiteHeader />
      {account.isLoading || account.data
        ? <main className="grid min-h-[60vh] place-items-center text-sm uppercase tracking-[.16em] text-mist">{t("opening")}</main>
        : <AuthPortal registering={registering} initialError={account.isError ? "service_unavailable" : undefined} />}
      <SiteFooter />
    </div>
  );
}
