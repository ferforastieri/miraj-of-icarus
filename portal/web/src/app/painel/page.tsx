"use client";

import Link from "next/link";
import { use, useEffect } from "react";
import { useAccount } from "@/api/authentication/get-account";
import { useLogout } from "@/api/authentication/logout";
import { useGameServers } from "@/api/game-servers/get-game-servers";
import { useLatestRelease } from "@/api/releases/get-latest-release";
import { AuthPortal } from "@/components/AuthPortal";
import { CharacterPanel } from "@/components/CharacterPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { routes } from "@/routes";

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export default function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string; erro?: string }>;
}) {
  const query = use(searchParams);
  const account = useAccount();
  const servers = useGameServers();
  const release = useLatestRelease();
  const logout = useLogout();

  useEffect(() => {
    if (!account.data) return;
    document.title = `Painel | Miraj of Icarus`;
  }, [account.data]);

  if (account.isLoading) {
    return <div className="min-h-screen bg-abyss"><SiteHeader compact /><main className="grid min-h-[60vh] place-items-center text-sm uppercase tracking-[.16em] text-mist">Abrindo o painel...</main></div>;
  }
  if (!account.data) {
    return <div className="min-h-screen overflow-hidden bg-abyss"><SiteHeader compact /><AuthPortal mode={query.modo ?? "login"} initialError={account.isError ? "service_unavailable" : query.erro} /></div>;
  }

  const availableServers = (servers.data ?? []).filter(server => server.available).length;
  const overviewClass = "flex min-h-[165px] flex-col justify-between bg-[linear-gradient(145deg,#24465a,#0b2638)] p-6 shadow-[inset_0_0_0_1px_#506d7b,inset_0_0_0_3px_#142c39] [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";
  const overviewLabel = "text-xs uppercase tracking-[.16em] text-ancient-gold";
  const overviewValue = "font-display text-2xl font-medium";
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(112,217,234,.14),transparent_28%)] bg-abyss">
      <SiteHeader compact />
      <main className="mx-auto w-[min(1180px,calc(100%-48px))] py-20 max-[620px]:w-[calc(100%-32px)] max-[620px]:pt-14">
        <header className="flex min-h-[250px] items-center justify-between gap-8 border-b border-moonsteel/20 max-[620px]:flex-col max-[620px]:items-start max-[620px]:py-12">
          <div><Kicker>Portal do jogador</Kicker><h1 className="mb-3 font-display text-[clamp(3.2rem,6vw,6rem)] font-medium leading-[.85]">Bem-vindo, <em className="font-normal text-frost">{account.data.userName}</em>.</h1><p className="text-mist">Acompanhe seus viajantes e prepare a próxima entrada no reino.</p></div>
          <Button variant="ghost" type="button" disabled={logout.isPending} onClick={() => logout.mutate()}>{logout.isPending ? "Saindo..." : "Sair da conta"}</Button>
        </header>

        {query.erro && <Alert className="mt-6" role="status">Sua sessão terminou. Entre novamente.</Alert>}

        <section className="my-10 mb-24 grid grid-cols-4 gap-2 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1" aria-label="Visão geral">
          <article className={overviewClass}><span className={overviewLabel}>Conta</span><strong className={overviewValue}>{account.data.userName}</strong><small className="text-mist">ID #{account.data.accountId}</small></article>
          <article className={overviewClass}><span className={overviewLabel}>Reinos</span><strong className={overviewValue}>{availableServers} online</strong><small className="text-mist">{servers.data?.length || "Nenhum"} configurado(s)</small></article>
          <article className={overviewClass}><span className={overviewLabel}>Release Alpha</span><strong className={overviewValue}>{release.data ? release.data.version.slice(0, 8) : "Em preparação"}</strong><small className="text-mist">{release.data ? formatBytes(release.data.totalSize) : "Sem download disponível"}</small></article>
          <article className={overviewClass}><span className={overviewLabel}>Launcher</span>{release.data ? <a className={`${overviewValue} text-frost`} href={release.data.launcherUrl}>Baixar para Windows ↓</a> : <strong className={overviewValue}>Indisponível</strong>}<small className="text-mist">Atualização e integridade automáticas</small></article>
        </section>

        <CharacterPanel enabled />

        <section className="mb-28 flex items-center justify-between gap-10 border-y border-moonsteel/20 p-10 max-[620px]:flex-col max-[620px]:items-start max-[620px]:px-0" aria-labelledby="security-title">
          <div><Kicker>Segurança</Kicker><h2 id="security-title" className="mb-2 font-display text-4xl font-medium">Sua sessão</h2><p className="max-w-[600px] text-mist">Este dispositivo permanecerá conectado por até 30 dias. Ao sair, a renovação desta sessão é revogada.</p></div>
          <Button type="button" disabled={logout.isPending} onClick={() => logout.mutate()}>Encerrar sessão</Button>
        </section>
        <Link className="text-xs text-mist" href={routes.home}>← Voltar para a landing page</Link>
      </main>
    </div>
  );
}
