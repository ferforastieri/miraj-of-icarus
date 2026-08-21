"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAccount } from "@/app/api/_react-query/authentication/get-account";
import { useLogout } from "@/app/api/_react-query/authentication/logout";
import { useGameServers } from "@/app/api/_react-query/game-servers/get-game-servers";
import { useLatestRelease } from "@/app/api/_react-query/releases/get-latest-release";
import { CharacterPanel } from "@/components/account/CharacterPanel";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";
import { routes } from "@/i18n/routing";

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export default function ClientPage() {
  const t = useTranslations("Client");
  const router = useRouter();
  const account = useAccount();
  const servers = useGameServers();
  const release = useLatestRelease();
  const logout = useLogout();
  useEffect(() => {
    if (!account.isLoading && !account.data) router.replace({ pathname: routes.login, query: { retorno: routes.client } });
  }, [account.data, account.isLoading, router]);
  if (account.isLoading || !account.data) return <div className="miraj-page"><SiteHeader /><main className="grid min-h-screen place-items-center pt-32 text-sm uppercase tracking-[.16em] text-mist">{t("loading")}</main><SiteFooter /></div>;

  const availableServers = (servers.data ?? []).filter(server => server.available).length;
  const card = "jade-card flex min-h-[180px] flex-col justify-between drop-shadow-[0_14px_20px_rgba(3,27,22,.28)]";
  return (
    <div className="miraj-page relative isolate">
      <WaterBackdrop fixed subtle />
      <SiteHeader />
      <main className="mx-auto w-[min(1180px,calc(100%-48px))] pb-20 pt-40 max-[700px]:pt-28 max-[620px]:w-[calc(100%-20px)]">
        <header className="jade-card flex min-h-[230px] items-center justify-between gap-8 max-[700px]:flex-col max-[700px]:items-start">
          <div><Kicker>{t("kicker")}</Kicker><h1 className="miraj-page-heading mb-3">{t("welcome", { name: account.data.userName })}</h1><p className="text-mist">{t("description")}</p></div>
          <Button type="button" disabled={logout.isPending} onClick={() => logout.mutate(undefined, { onSuccess: () => router.push(routes.login) })}>{t("logout")}</Button>
        </header>
        <section className="my-10 grid grid-cols-4 gap-2 max-[920px]:grid-cols-2 max-[560px]:grid-cols-1" aria-label={t("overviewAria")}>
          <article className={card}><span className="text-xs uppercase tracking-[.16em] text-ancient-gold">{t("account")}</span><strong className="text-2xl">{account.data.userName}</strong><small className="text-mist">ID #{account.data.accountId}</small></article>
          <article className={card}><span className="text-xs uppercase tracking-[.16em] text-ancient-gold">{t("realms")}</span><strong className="text-2xl">{t("online", { count: availableServers })}</strong><small className="text-mist">{t("configured", { count: servers.data?.length || 0 })}</small></article>
          <article className={card}><span className="text-xs uppercase tracking-[.16em] text-ancient-gold">{t("alphaRelease")}</span><strong className="text-2xl">{release.data ? release.data.version.slice(0, 8) : t("preparing")}</strong><small className="text-mist">{release.data ? formatBytes(release.data.totalSize) : t("noRelease")}</small></article>
          <article className={card}><span className="text-xs uppercase tracking-[.16em] text-ancient-gold">{t("launcher")}</span>{release.data ? <a className="text-2xl text-jade focus-visible:text-white" href={release.data.launcherUrl}>{t("downloadWindows")} ↓</a> : <strong className="text-2xl">{t("unavailable")}</strong>}<small className="text-mist">{t("clientAfterLogin")}</small></article>
        </section>
        <CharacterPanel enabled />
        {account.data.role === "Administrator" && <Link className="mb-8 inline-block text-jade" href={routes.panel}>{t("openAdmin")} →</Link>}
        <section className="jade-card mb-20 flex items-center justify-between gap-8 max-[620px]:flex-col max-[620px]:items-start"><div><Kicker>{t("security")}</Kicker><h2 className="text-4xl">{t("session")}</h2><p className="max-w-[580px] text-mist">{t("sessionDescription")}</p></div><Button onClick={() => logout.mutate(undefined, { onSuccess: () => router.push(routes.login) })}>{t("endSession")}</Button></section>
      </main><SiteFooter />
    </div>
  );
}
