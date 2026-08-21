"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLatestRelease } from "@/app/api/_react-query/releases/get-latest-release";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";
import { routes } from "@/i18n/routing";

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export default function DownloadPage() {
  const t = useTranslations("Download");
  const format = useFormatter();
  const releaseQuery = useLatestRelease();
  const release = releaseQuery.data ?? null;

  return (
    <div className="miraj-page">
      <section className="miraj-page-hero px-6 pb-12 pt-52 text-center max-[700px]:px-4 max-[700px]:pt-28">
        <WaterBackdrop />
        <SiteHeader />
        <div className="w-[min(850px,100%)]">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.24em] text-[#a9e9c4]">{t("kicker")}</p>
          <h1 className="miraj-page-heading mt-4">{t("title")}</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#d9e5da]">{t("description")}</p>
          <div className="mx-auto mt-10 grid w-full max-w-[620px] grid-cols-2 gap-3 max-[700px]:grid-cols-1">
            {release ? <a className={`${buttonStyles("primary", true)} w-full !min-w-0`} href={release.launcherUrl}>{t("downloadLauncher")}</a> : <span className={`${buttonStyles("primary", true)} w-full !min-w-0`} aria-disabled="true">{t("preparing")}</span>}
            <Link className={`${buttonStyles("ghost", true)} w-full !min-w-0`} href={routes.register}>{t("createAccount")}</Link>
          </div>
          {release && <p className="mt-5 text-xs uppercase tracking-[.12em] text-[#c9d8ca]">{t("releaseDetails", { version: release.version.slice(0, 8), size: formatBytes(release.totalSize), date: format.dateTime(new Date(release.publishedAt)) })}</p>}
          {releaseQuery.isError && <p className="mx-auto mt-6 max-w-xl text-sm text-[#d8cfae]">{t("error")}</p>}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
