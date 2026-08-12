"use client";

import Image from "next/image";
import Link from "next/link";
import { useGameServers } from "@/api/game-servers/get-game-servers";
import { useLatestRelease } from "@/api/releases/get-latest-release";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { routes } from "@/routes";

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

const sectionTitle = "mb-5 font-display text-[clamp(2.65rem,5vw,5rem)] font-medium leading-[.95] tracking-[-.025em]";
const bodyCopy = "max-w-[590px] text-base leading-[1.8] text-mist";

export default function HomePage() {
  const releaseQuery = useLatestRelease();
  const serversQuery = useGameServers();
  const release = releaseQuery.data ?? null;
  const servers = serversQuery.data ?? [];
  const availableServers = servers.filter(server => server.available).length;

  return (
    <div className="min-h-screen overflow-hidden bg-abyss">
      <section className="relative isolate grid min-h-svh place-items-center overflow-hidden border-b border-ancient-gold/30 max-[620px]:min-h-[780px]" id="inicio" aria-labelledby="hero-title">
        <div data-testid="hero-image" className="absolute inset-0 -z-30 scale-[1.025] animate-hero-arrival bg-[url('/media/citadel.png')] bg-cover bg-[center_43%]" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(7,11,16,.92)_0%,rgba(7,11,16,.25)_31%,rgba(7,11,16,.15)_60%,rgba(7,11,16,.84)_100%),linear-gradient(180deg,rgba(7,11,16,.68)_0%,transparent_30%,transparent_62%,#070b10_100%)]" aria-hidden="true" />
        <SiteHeader />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-50" aria-hidden="true">
          <i className="absolute -top-1/4 left-[39%] h-[110%] w-0.5 -rotate-1 bg-gradient-to-b from-transparent via-[rgba(217,246,255,.86)] to-transparent blur-[.4px]" />
          <i className="absolute -top-1/4 left-[65.5%] h-[110%] w-0.5 -rotate-1 bg-gradient-to-b from-transparent via-[rgba(217,246,255,.86)] to-transparent blur-[.4px]" />
          <i className="absolute -top-1/4 left-[67%] h-[110%] w-0.5 -rotate-1 bg-gradient-to-b from-transparent via-frost/30 to-transparent opacity-30 blur-[.4px]" />
        </div>
        <div className="w-[min(760px,calc(100%-40px))] pt-40 text-center [text-shadow:0_3px_20px_rgba(0,0,0,.9)] max-[620px]:pt-24">
          <p className="mb-5 flex items-center justify-center gap-3.5 text-[.66rem] font-semibold uppercase tracking-[.24em] text-[#bcdce2] before:h-px before:w-10 before:bg-ancient-gold after:h-px after:w-10 after:bg-ancient-gold">Alpha · Acesso para Windows</p>
          <h1 id="hero-title" className="mb-4 font-display text-[clamp(4.5rem,8.5vw,8.4rem)] font-medium leading-[.75] tracking-[-.04em] max-[620px]:text-[4.55rem] max-[620px]:leading-[.78]">
            A passagem<br /><em className="inline-block font-normal text-[#f3fbfd] [text-shadow:0_3px_20px_#000,0_0_34px_rgba(82,212,231,.25)]">está aberta.</em>
          </h1>
          <p className="mx-auto max-w-[590px] text-base leading-7 text-[#c5d0d4]">Um mundo preservado com cuidado e reconstruído sobre uma fundação preparada para durar.</p>
          <div className="mt-8 flex justify-center gap-3 max-[620px]:flex-col">
            {release ? (
              <a className={buttonStyles("primary")} href={release.launcherUrl}>Baixar launcher <span aria-hidden="true">↓</span></a>
            ) : (
              <span className="inline-flex min-h-12 items-center justify-center rounded-[2px] border border-moonsteel/20 bg-abyss/70 px-6 text-xs font-semibold uppercase tracking-[.12em] text-mist" aria-disabled="true">
                {releaseQuery.isLoading ? "Consultando release" : "Download indisponível"}
              </span>
            )}
            <Link className={buttonStyles("ghost")} href={routes.panel}>Acessar painel</Link>
          </div>
        </div>
        <a className="absolute bottom-6 grid justify-items-center gap-2 text-[.64rem] uppercase tracking-[.2em] text-moonsteel/65 max-[620px]:hidden" href="#jogo">
          <span>Conheça o mundo</span><i className="h-8 w-px bg-gradient-to-b from-ancient-gold to-transparent" aria-hidden="true" />
        </a>
      </section>

      <main>
        <section className="mx-auto grid min-h-[760px] w-[min(1180px,calc(100%-48px))] grid-cols-[.9fr_1.1fr] items-center gap-24 max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[900px]:py-24 max-[620px]:min-h-0 max-[620px]:w-[calc(100%-32px)]" id="jogo">
          <div>
            <Kicker>Além do portão</Kicker>
            <h2 className={sectionTitle}>O mundo que você lembra respira outra vez.</h2>
            <p className={bodyCopy}>Masicarus é um MMORPG em reconstrução. Mapas, criaturas e a atmosfera original permanecem no centro enquanto cada sistema recebe uma implementação própria, segura e moderna.</p>
            <div className="mt-10 flex flex-wrap gap-2.5" aria-label="Características do projeto">
              {["Cliente nativo", "Mundo persistente", "Jornada compartilhada"].map(note => <span className="border-l border-ancient-gold px-3 py-2 text-xs uppercase tracking-[.08em] text-[#bdc8cc]" key={note}>{note}</span>)}
            </div>
          </div>
          <div className="relative aspect-[4/5] max-h-[600px] overflow-hidden border border-ancient-gold/40 bg-[url('/media/citadel.png')] bg-[length:auto_100%] bg-[53%_center] bg-no-repeat shadow-[0_30px_80px_rgba(0,0,0,.45)] before:absolute before:inset-3.5 before:border before:border-moonsteel/20 before:shadow-[inset_0_0_80px_rgba(7,11,16,.7)] max-[900px]:aspect-[5/3] max-[900px]:w-full max-[900px]:justify-self-center max-[900px]:bg-cover max-[620px]:aspect-[4/5]" aria-hidden="true">
            <span className="absolute right-0 bottom-0 bg-abyss/90 px-6 py-4 text-xs uppercase tracking-[.18em] text-ancient-gold">O reino além do portão</span>
          </div>
        </section>

        <section className="grid min-h-[720px] grid-cols-[.8fr_1.2fr] items-center gap-24 border-y border-moonsteel/20 bg-gradient-to-r from-[rgba(21,28,34,.98)] to-[rgba(9,14,18,.98)] px-[max(24px,calc((100%-1180px)/2))] py-24 max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[620px]:px-4" id="reconstrucao">
          <div className="relative grid place-items-center before:absolute before:aspect-square before:w-[70%] before:rotate-45 before:border before:border-frost/20 before:shadow-[0_0_90px_rgba(82,212,231,.08)] max-[900px]:order-2 max-[900px]:max-h-[340px] max-[900px]:overflow-hidden">
            <Image className="relative w-[min(420px,90%)] drop-shadow-[0_28px_30px_rgba(0,0,0,.65)] max-[900px]:w-[300px]" src="/media/mark.png" alt="" width={420} height={420} />
          </div>
          <div>
            <Kicker>Reconstruído para durar</Kicker>
            <h2 className={sectionTitle}>Memória preservada.<br />Fundação renovada.</h2>
            <p className={bodyCopy}>O launcher, o cliente e os serviços evoluem juntos em jornadas completas. Cada release é assinada, verificada e distribuída de forma reproduzível.</p>
            <ul className="mt-10 max-w-[610px] border-t border-moonsteel/20">
              {[["Integridade", "Arquivos validados antes de abrir o jogo."], ["Evolução", "Atualizações diferenciais pelo próprio launcher."], ["Preservação", "Identidade e conteúdo tratados como parte do mundo."]].map(([title, copy]) => (
                <li className="grid min-h-[76px] grid-cols-[130px_1fr] items-center border-b border-moonsteel/20 max-[620px]:grid-cols-1 max-[620px]:gap-1 max-[620px]:py-4" key={title}>
                  <strong className="font-display text-xl font-medium">{title}</strong><span className="text-sm text-mist">{copy}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-[min(1180px,calc(100%-48px))] py-32 max-[620px]:w-[calc(100%-32px)]" id="reinos">
          <div className="mb-11 flex items-end justify-between gap-8 max-[620px]:flex-col max-[620px]:items-start">
            <div><Kicker>Estado dos reinos</Kicker><h2 className={`${sectionTitle} mb-0`}>Escolha sua passagem.</h2></div>
            <span className="border border-moonsteel/20 px-3 py-2 text-xs uppercase tracking-[.14em] text-mist">
              <i className={`mr-2 inline-block size-1.5 rounded-full ${availableServers ? "bg-frost shadow-[0_0_8px_#52d4e7]" : "bg-danger shadow-[0_0_8px_#c55a62]"}`} />
              {serversQuery.isLoading ? "Consultando" : availableServers ? `${availableServers} disponível` : "Indisponível"}
            </span>
          </div>
          <div className="border-t border-moonsteel/20">
            {servers.map(server => (
              <article className="flex min-h-28 items-center justify-between border-b border-moonsteel/20 bg-gradient-to-r from-iron/45 to-transparent px-7 py-5 max-[620px]:px-4" key={server.id}>
                <div><span className="text-xs uppercase tracking-[.18em] text-ancient-gold">{server.region}</span><h3 className="mt-1 font-display text-2xl font-medium">{server.name}</h3></div>
                <span className={`text-xs uppercase tracking-[.15em] ${server.available ? "text-frost" : "text-mist"}`}>{server.available ? "Online" : "Manutenção"}</span>
              </article>
            ))}
            {!serversQuery.isLoading && !servers.length && <p className="py-10 text-mist">Não foi possível consultar os reinos agora.</p>}
          </div>
        </section>

        <section className="relative flex min-h-[680px] flex-col items-center justify-center overflow-hidden border-t border-moonsteel/20 bg-[linear-gradient(rgba(7,11,16,.78),rgba(7,11,16,.96)),url('/media/citadel.png')] bg-cover bg-[center_38%] px-6 py-28 text-center" id="download">
          <div className="pointer-events-none absolute top-[35%] left-1/2 h-[400px] w-[700px] -translate-1/2 bg-[radial-gradient(ellipse,rgba(82,212,231,.18),transparent_68%)]" aria-hidden="true" />
          <Image className="relative mb-0.5 w-[130px] drop-shadow-[0_15px_16px_#000]" src="/media/mark.png" alt="" width={180} height={180} />
          <Kicker>Masicarus para Windows</Kicker>
          <h2 className={`${sectionTitle} max-w-[800px]`}>Seu caminho começa pelo launcher.</h2>
          <p className="mb-8 max-w-[580px] leading-7 text-[#aebdc2]">Baixe uma vez. O launcher instala, verifica e mantém o cliente atualizado antes de cada jornada.</p>
          {release ? (
            <>
              <a className={buttonStyles("primary", true)} href={release.launcherUrl}>Baixar launcher para Windows <span>↓</span></a>
              <div className="mt-5 flex text-xs uppercase tracking-[.08em] text-mist max-[620px]:flex-col max-[620px]:gap-1.5">
                <span className="border-r border-moonsteel/20 px-4 max-[620px]:border-0">Versão {release.version.slice(0, 8)}</span>
                <span className="border-r border-moonsteel/20 px-4 max-[620px]:border-0">{formatBytes(release.totalSize)}</span>
                <span className="px-4">Publicada em {new Intl.DateTimeFormat("pt-BR").format(new Date(release.publishedAt))}</span>
              </div>
            </>
          ) : !releaseQuery.isLoading && (
            <div className="grid gap-1 border border-moonsteel/20 bg-abyss/70 px-6 py-4">
              <strong className="font-display text-xl text-ancient-gold">Release em preparação</strong>
              <span className="text-sm text-mist">O download aparecerá aqui assim que o canal Alpha estiver disponível.</span>
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto flex min-h-28 w-[min(1180px,calc(100%-48px))] items-center justify-between text-xs text-[#718087] max-[620px]:w-[calc(100%-32px)] max-[620px]:flex-col max-[620px]:gap-4 max-[620px]:py-8">
        <Link className="flex items-center gap-2 font-display tracking-[.18em] text-moonsteel" href="#inicio"><Image src="/media/mark.png" alt="" width={36} height={36} /><span>MASICARUS</span></Link>
        <p>Uma reconstrução independente em andamento.</p><p>© {new Date().getFullYear()} Masicarus</p>
      </footer>
    </div>
  );
}
