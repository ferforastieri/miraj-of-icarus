"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAccount } from "@/app/api/_react-query/authentication/get-account";
import { useAdminAccounts, useAdminAudit, useAdminCharacters, useAdminDeleteCharacter, useAdminOverview, useAdminRestoreCharacter, useSetMaintenance, useSuspendAccount, useRestoreAccount } from "@/app/api/_react-query/administration/admin";
import { useGameServers } from "@/app/api/_react-query/game-servers/get-game-servers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Kicker } from "@/components/ui/Kicker";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";
import { routes } from "@/i18n/routing";
import { gameClassIds } from "@/components/game/model";

export default function AdministrationPage() {
  const t = useTranslations("Admin");
  const classesT = useTranslations("Classes");
  const format = useFormatter();
  const router = useRouter();
  const account = useAccount();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const overview = useAdminOverview(account.data?.role === "Administrator");
  const accounts = useAdminAccounts(query, page, account.data?.role === "Administrator");
  const characters = useAdminCharacters(selectedAccount, account.data?.role === "Administrator");
  const audit = useAdminAudit(account.data?.role === "Administrator");
  const servers = useGameServers();
  const suspend = useSuspendAccount();
  const restore = useRestoreAccount();
  const deleteCharacter = useAdminDeleteCharacter();
  const restoreCharacter = useAdminRestoreCharacter();
  const maintenance = useSetMaintenance();
  useEffect(() => {
    if (!account.isLoading && !account.data) router.replace({ pathname: routes.login, query: { retorno: routes.panel } });
    if (account.data && account.data.role !== "Administrator") router.replace(routes.client);
  }, [account.data, account.isLoading, router]);
  if (account.isLoading || account.data?.role !== "Administrator") return <div className="miraj-page"><SiteHeader /><main className="grid min-h-screen place-items-center pt-32 text-sm uppercase tracking-[.16em] text-mist">{t("validating")}</main><SiteFooter /></div>;

  const stat = "jade-card flex min-h-[160px] flex-col justify-between";
  return (
    <div className="miraj-page relative isolate"><WaterBackdrop fixed subtle /><SiteHeader />
      <main className="mx-auto w-[min(1180px,calc(100%-40px))] pb-16 pt-40 max-[700px]:pt-28 max-[560px]:w-[calc(100%-18px)]">
        <header className="jade-card">
          <Kicker>{t("kicker")}</Kicker>
          <h1 className="miraj-page-heading mb-4">{t("title")}</h1>
          <p className="max-w-2xl text-mist">{t("description")}</p>
        </header>
        {overview.isError && <Alert className="mt-6">{t("loadError")}</Alert>}
        <section className="my-10 grid grid-cols-4 gap-2 max-[800px]:grid-cols-2 max-[480px]:grid-cols-1">
          <article className={stat}><span className="text-ancient-gold">{t("accounts")}</span><strong className="text-4xl">{overview.data?.accounts ?? "-"}</strong></article>
          <article className={stat}><span className="text-ancient-gold">{t("characters")}</span><strong className="text-4xl">{overview.data?.characters ?? "-"}</strong></article>
          <article className={stat}><span className="text-ancient-gold">{t("realms")}</span><strong className="text-4xl">{overview.data ? `${overview.data.availableServers}/${overview.data.totalServers}` : "-"}</strong></article>
          <article className={stat}><span className="text-ancient-gold">{t("release")}</span><strong className="text-2xl">{overview.data?.release?.version.slice(0, 8) ?? t("noRelease")}</strong></article>
        </section>
        <section className="jade-card mb-16" aria-labelledby="accounts-title">
          <div className="mb-6 flex items-end justify-between gap-5 max-[640px]:flex-col max-[640px]:items-stretch"><div><Kicker>{t("moderation")}</Kicker><h2 id="accounts-title" className="text-4xl">{t("accounts")}</h2></div><label className="grid gap-2 text-xs uppercase text-mist">{t("search")}<Input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder={t("accountName")} /></label></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead className="text-xs uppercase tracking-[.12em] text-ancient-gold"><tr><th className="p-3">{t("account")}</th><th className="p-3">{t("role")}</th><th className="p-3">{t("status")}</th><th className="p-3">{t("actions")}</th></tr></thead><tbody>{accounts.data?.items.map(item => <tr className="border-t border-jade/20" key={item.accountId}><td className="p-3"><button className="text-left text-jade focus-visible:text-white" onClick={() => setSelectedAccount(item.accountId)}>{item.userName}<small className="block text-mist">#{item.accountId}</small></button></td><td className="p-3">{t(`roles.${item.role}`)}</td><td className="p-3">{t(`statuses.${item.status}`)}</td><td className="flex gap-1 p-3">{item.status === "Active" ? <Button className="min-w-[140px]" variant="danger" onClick={() => { const reason = window.prompt(t("suspensionReason")); if (reason) suspend.mutate({ accountId: item.accountId, reason }); }}>{t("suspend")}</Button> : <Button className="min-w-[140px]" onClick={() => restore.mutate(item.accountId)}>{t("restore")}</Button>}<Button className="min-w-[140px]" onClick={() => setSelectedAccount(item.accountId)}>{t("characters")}</Button></td></tr>)}</tbody></table></div>
          <div className="mt-5 flex items-center justify-between"><Button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{t("previous")}</Button><span className="text-sm text-mist">{t("page", { page })}</span><Button disabled={!accounts.data || page * accounts.data.pageSize >= accounts.data.total} onClick={() => setPage(value => value + 1)}>{t("next")}</Button></div>
        </section>
        {selectedAccount !== null && <section className="jade-card mb-16"><div className="mb-5 flex items-center justify-between"><div><Kicker>{t("account")} #{selectedAccount}</Kicker><h2 className="text-4xl">{t("characters")}</h2></div><Button onClick={() => setSelectedAccount(null)}>{t("close")}</Button></div><div className="grid gap-2">{characters.data?.map(character => { const knownClass = gameClassIds.find(classId => classId === character.archetype); return <article className="flex items-center justify-between gap-4 border-y border-jade/20 p-4 max-[560px]:flex-col max-[560px]:items-start" key={character.id}><div><strong className="text-xl">{character.name}</strong><p className="text-sm text-mist">{knownClass ? classesT(`items.${knownClass}.name`) : character.archetype} · {t("level", { level: character.level })}{character.deletionScheduledAt ? ` · ${t("deletionScheduled")}` : ""}</p></div>{character.deletionScheduledAt ? <Button onClick={() => restoreCharacter.mutate({ accountId: selectedAccount, characterId: character.id })}>{t("cancelDeletion")}</Button> : <Button variant="danger" onClick={() => { if (window.confirm(t("scheduleDeletionQuestion", { name: character.name }))) deleteCharacter.mutate({ accountId: selectedAccount, characterId: character.id }); }}>{t("scheduleDeletion")}</Button>}</article>; })}</div></section>}
        <section className="jade-card mb-16"><Kicker>{t("operation")}</Kicker><h2 className="mb-5 text-4xl">{t("maintenanceTitle")}</h2><div className="grid gap-2">{servers.data?.map(server => <article className="flex items-center justify-between gap-5 border-y border-jade/20 p-4 max-[620px]:flex-col max-[620px]:items-start" key={server.id}><div><strong className="text-xl">{server.name}</strong><p className="text-sm text-mist">{server.available ? t("available") : server.maintenanceMessage || t("unavailable")}</p></div>{server.maintenanceMessage ? <Button onClick={() => maintenance.mutate({ serverId: server.id, enabled: false })}>{t("endMaintenance")}</Button> : <Button variant="danger" onClick={() => { const message = window.prompt(t("maintenanceMessage")); if (message) maintenance.mutate({ serverId: server.id, enabled: true, message }); }}>{t("startMaintenance")}</Button>}</article>)}</div></section>
        <section className="jade-card mb-16"><Kicker>{t("security")}</Kicker><h2 className="mb-5 text-4xl">{t("audit")}</h2><div className="grid gap-2">{audit.data?.map(entry => <article className="border-y border-jade/20 p-4" key={entry.id}><strong>{entry.action}</strong><span className="mx-2 text-ancient-gold">{entry.target}</span><time className="block text-sm text-mist">{format.dateTime(new Date(entry.createdAt), { dateStyle: "short", timeStyle: "short" })}</time></article>)}</div></section>
      </main><SiteFooter />
    </div>
  );
}
