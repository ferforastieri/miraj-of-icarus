"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLatestRelease } from "@/api/releases/get-latest-release";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { routes } from "@/routes";

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
    <div className="min-h-screen bg-[#041d19]">
      <section className="relative isolate grid min-h-[82svh] place-items-center overflow-hidden px-6 pb-20 pt-56 text-center max-[700px]:px-4 max-[700px]:pt-32">
        <div className="absolute inset-0 -z-20 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,25,21,.45),rgba(3,25,21,.94)),radial-gradient(circle_at_50%_44%,rgba(45,157,99,.2),transparent_44%)]" aria-hidden="true" />
        <SiteHeader />
        <div className="w-[min(850px,100%)]">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.24em] text-[#a9e9c4]">{t("kicker")}</p>
          <h1 className="mt-4 font-miraj-of-icarus text-[clamp(3.1rem,7vw,6.8rem)] leading-[.84] text-[#f4f1df] [text-shadow:0_3px_12px_#031b16]">{t("title")}</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#d9e5da]">{t("description")}</p>
          <div className="mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-3 max-[560px]:w-full max-[560px]:flex-col">
            {release ? <a className={buttonStyles("primary", true)} href={release.launcherUrl}>{t("downloadLauncher")}</a> : <span className={buttonStyles("primary", true)} aria-disabled="true">{t("preparing")}</span>}
            <Link className={buttonStyles("ghost", true)} href={routes.register}>{t("createAccount")}</Link>
          </div>
          {release && <p className="mt-5 text-xs uppercase tracking-[.12em] text-[#c9d8ca]">{t("releaseDetails", { version: release.version.slice(0, 8), size: formatBytes(release.totalSize), date: format.dateTime(new Date(release.publishedAt)) })}</p>}
          {releaseQuery.isError && <p className="mx-auto mt-6 max-w-xl text-sm text-[#d8cfae]">{t("error")}</p>}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
