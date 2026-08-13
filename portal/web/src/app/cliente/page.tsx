"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAccount } from "@/api/authentication/get-account";
import { useLogout } from "@/api/authentication/logout";
import { useGameServers } from "@/api/game-servers/get-game-servers";
import { useLatestRelease } from "@/api/releases/get-latest-release";
import { CharacterPanel } from "@/components/CharacterPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { routes } from "@/routes";

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export default function ClientPage() {
  const account = useAccount();
  const servers = useGameServers();
  const release = useLatestRelease();
  const logout = useLogout();
  useEffect(() => {
    if (!account.isLoading && !account.data) window.location.replace(`${routes.login}?retorno=${encodeURIComponent(routes.client)}`);
  }, [account.data, account.isLoading]);
  if (account.isLoading || !account.data) return <div className="min-h-screen bg-abyss"><SiteHeader compact /><main className="grid min-h-[60vh] place-items-center text-sm uppercase tracking-[.16em] text-mist">Abrindo a área do cliente...</main></div>;

  const availableServers = (servers.data ?? []).filter(server => server.available).length;
  const card = "jade-card flex min-h-[180px] flex-col justify-between drop-shadow-[0_14px_20px_rgba(3,27,22,.28)]";
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(40,185,111,.16),transparent_28%)] bg-abyss">
      <SiteHeader compact />
      <main className="mx-auto w-[min(1180px,calc(100%-48px))] py-20 max-[620px]:w-[calc(100%-20px)] max-[620px]:pt-10">
        <header className="flex min-h-[230px] items-center justify-between gap-8 border-b border-jade/25 max-[700px]:flex-col max-[700px]:items-start max-[700px]:py-10">
          <div><Kicker>Área do cliente</Kicker><h1 className="mb-3 font-display text-[clamp(2.7rem,6vw,5.5rem)] leading-[.9]">Bem-vindo, <em className="font-normal text-jade">{account.data.userName}</em>.</h1><p className="text-mist">Gerencie seus viajantes e prepare a próxima entrada no reino.</p></div>
          <Button type="button" disabled={logout.isPending} onClick={() => logout.mutate(undefined, { onSuccess: () => window.location.assign(routes.login) })}>Sair da conta</Button>
        </header>
        <section className="my-10 grid grid-cols-4 gap-2 max-[920px]:grid-cols-2 max-[560px]:grid-cols-1" aria-label="Visão geral">
          <article className={card}><span className="text-xs uppercase tracking-[.16em] text-ancient-gold">Conta</span><strong className="text-2xl">{account.data.userName}</strong><small className="text-mist">ID #{account.data.accountId}</small></article>
          <article className={card}><span className="text-xs uppercase tracking-[.16em] text-ancient-gold">Reinos</span><strong className="text-2xl">{availableServers} online</strong><small className="text-mist">{servers.data?.length || 0} configurado(s)</small></article>
          <article className={card}><span className="text-xs uppercase tracking-[.16em] text-ancient-gold">Release Alpha</span><strong className="text-2xl">{release.data ? release.data.version.slice(0, 8) : "Em preparação"}</strong><small className="text-mist">{release.data ? formatBytes(release.data.totalSize) : "Sem release"}</small></article>
          <article className={card}><span className="text-xs uppercase tracking-[.16em] text-ancient-gold">Launcher</span>{release.data ? <a className="text-2xl text-jade focus-visible:text-white" href={release.data.launcherUrl}>Baixar para Windows ↓</a> : <strong className="text-2xl">Indisponível</strong>}<small className="text-mist">O cliente é instalado após o login</small></article>
        </section>
        <CharacterPanel enabled />
        {account.data.role === "Administrator" && <Link className="mb-8 inline-block text-jade" href={routes.panel}>Abrir administração →</Link>}
        <section className="mb-20 flex items-center justify-between gap-8 border-y border-jade/25 p-8 max-[620px]:flex-col max-[620px]:items-start max-[620px]:px-0"><div><Kicker>Segurança</Kicker><h2 className="text-4xl">Sua sessão</h2><p className="max-w-[580px] text-mist">Sessão persistente por até 30 dias, armazenada somente em cookies HttpOnly.</p></div><Button onClick={() => logout.mutate(undefined, { onSuccess: () => window.location.assign(routes.login) })}>Encerrar sessão</Button></section>
      </main>
    </div>
  );
}
