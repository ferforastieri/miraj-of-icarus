"use client";

import Image from "next/image";
import Link from "next/link";
import { useGameServers } from "@/api/game-servers/get-game-servers";
import { useLatestRelease } from "@/api/releases/get-latest-release";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { buttonStyles } from "@/components/ui/Button";
import { routes } from "@/routes";

const paths = [
  { id: "warrior", label: "Guerreiro" },
  { id: "guardian", label: "Guardião" },
  { id: "thief", label: "Assassino" },
  { id: "priest", label: "Sacerdote" },
  { id: "wizard", label: "Mago" },
  { id: "archer", label: "Arqueiro" },
  { id: "idoll", label: "Idol" },
  { id: "magician", label: "Magician" },
] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function OrnamentTitle({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="flex w-full items-center justify-center gap-4" aria-hidden="true">
      <i className={`h-px w-[min(150px,18vw)] bg-gradient-to-r from-transparent ${light ? "via-[#eee7d6]" : "via-[#967332]"} to-transparent`} />
      <span className="size-3 bg-[#16834f] shadow-[inset_0_0_0_1px_#91e5b4,inset_0_0_0_3px_#0a3a35,0_0_8px_#28b96f] [clip-path:polygon(25%_7%,75%_7%,100%_50%,75%_93%,25%_93%,0_50%)]" />
      <span className={`font-miraj-of-icarus text-xs font-semibold uppercase tracking-[.2em] ${light ? "text-[#f2edda]" : "text-[#765821]"}`}>{children}</span>
      <span className="size-3 bg-[#16834f] shadow-[inset_0_0_0_1px_#91e5b4,inset_0_0_0_3px_#0a3a35,0_0_8px_#28b96f] [clip-path:polygon(25%_7%,75%_7%,100%_50%,75%_93%,25%_93%,0_50%)]" />
      <i className={`h-px w-[min(150px,18vw)] bg-gradient-to-l from-transparent ${light ? "via-[#e8e3c9]" : "via-[#967332]"} to-transparent`} />
    </div>
  );
}

function GamePlaque({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <span className={`inline-flex min-h-[54px] min-w-[210px] items-center justify-center bg-[length:100%_100%] bg-center bg-no-repeat px-8 font-miraj-of-icarus text-xs font-semibold uppercase tracking-[.06em] [text-shadow:0_2px_2px_#041b16] ${disabled ? "bg-[url('/media/game-ui/jade/button-disabled.png')] text-[#89958e]" : "bg-[url('/media/game-ui/jade/button-default.png')] text-[#e4ecdf]"}`}>
      {children}
    </span>
  );
}

function SectionGate({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 mx-auto -mb-8 grid h-[72px] w-[min(620px,84vw)] place-items-center bg-[url('/media/game-ui/jade/button-default.png')] bg-[length:100%_100%] bg-center bg-no-repeat font-miraj-of-icarus text-[clamp(1.25rem,2.7vw,2rem)] uppercase tracking-[.14em] text-[#eef7ed] [text-shadow:0_2px_3px_#041b16,0_0_8px_#16834f]">
      {children}
    </div>
  );
}

export default function HomePage() {
  const releaseQuery = useLatestRelease();
  const serversQuery = useGameServers();
  const release = releaseQuery.data ?? null;
  const servers = serversQuery.data ?? [];
  const availableServers = servers.filter(server => server.available).length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#061f20]">
      <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[#dce9df] max-[700px]:min-h-[800px]" id="inicio" aria-labelledby="hero-title">
        <div data-testid="hero-image" className="absolute inset-0 -z-30 animate-hero-arrival bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center max-[700px]:bg-[57%_center]" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_42%,transparent_0_28%,rgba(6,39,32,.12)_57%,rgba(4,25,21,.62)_100%),linear-gradient(180deg,rgba(6,39,32,.18)_0%,transparent_24%,transparent_62%,rgba(4,25,21,.78)_100%)] max-[700px]:bg-[linear-gradient(180deg,rgba(4,25,21,.28),transparent_30%,rgba(4,25,21,.18)_52%,rgba(4,25,21,.88)_84%)]" aria-hidden="true" />
        <SiteHeader />

        <div className="relative mx-auto flex min-h-[calc(100svh-118px)] w-[min(820px,calc(100%-36px))] flex-col items-center justify-center pb-48 pt-40 text-center max-[700px]:min-h-[720px] max-[700px]:justify-end max-[700px]:pb-40 max-[700px]:pt-32">
          <OrnamentTitle light>O chamado dos reinos</OrnamentTitle>
          <h1 id="hero-title" className="my-5 font-miraj-of-icarus text-[clamp(2.8rem,6vw,5.7rem)] font-semibold uppercase leading-[.91] tracking-[.02em] text-[#f7f2d7] [text-shadow:0_3px_2px_#06271f,0_0_12px_#06271f,0_0_28px_#06271f]">
            A passagem está aberta
          </h1>
          <p className="max-w-[600px] text-[clamp(1rem,1.55vw,1.3rem)] font-medium leading-relaxed text-white [text-shadow:0_2px_8px_#06271f,0_0_14px_#06271f]">
            Retorne aos céus de Miraj of Icarus. Reúna seus aliados, escolha seu caminho e atravesse os portões de um mundo reconstruído.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 max-[600px]:w-full max-[600px]:flex-col max-[600px]:gap-1">
            {release ? (
              <a className={buttonStyles("primary", true)} href={release.launcherUrl}>Baixar launcher</a>
            ) : (
              <GamePlaque disabled>{releaseQuery.isLoading ? "Consultando release" : "Download indisponível"}</GamePlaque>
            )}
          <Link className={buttonStyles("ghost", true)} href={routes.login}>Entrar</Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-y border-[#8b794f] bg-[linear-gradient(180deg,rgba(7,56,46,.92),rgba(4,27,23,.98))] shadow-[0_-15px_35px_rgba(3,24,20,.45)]">
          <div className="mx-auto flex h-[124px] w-[min(760px,calc(100%-24px))] items-center justify-center gap-5 max-[700px]:h-[112px] max-[700px]:gap-1" aria-label="Caminhos disponíveis">
            {paths.map((path, index) => (
              <a className="group relative grid w-[96px] shrink-0 place-items-center pt-2 max-[700px]:w-[15.5vw]" href="#jogo" key={path.id} aria-label={path.label}>
                <Image className="size-[71px] object-contain max-[700px]:size-[56px]" src={`/media/game-ui/classes/bronze/${path.id}.png`} alt="" width={256} height={256} />
                <span className={`font-miraj-of-icarus text-[.68rem] uppercase tracking-[.04em] text-[#b8c8bc] max-[700px]:hidden ${index === 0 ? "text-[#70d69d]" : ""}`}>{path.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="w-full">
        <SectionGate>O mundo</SectionGate>
        <section className="relative isolate w-full overflow-hidden bg-[linear-gradient(180deg,#dfe9dc_0%,#f7f0dc_48%,#d8e4d5_100%)] px-6 pb-28 pt-28 text-[#18372f] max-[700px]:px-4" id="jogo">
          <div className="absolute inset-0 -z-10 opacity-25 [background-image:radial-gradient(circle_at_15%_10%,white_0_12%,transparent_30%),radial-gradient(circle_at_85%_35%,white_0_9%,transparent_28%)]" aria-hidden="true" />
          <div className="mx-auto grid w-[min(1180px,100%)] grid-cols-[.95fr_1.05fr] items-center gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-14">
            <div className="relative min-h-[520px] overflow-hidden border-y border-[#92713c] bg-[url('/media/portal-hero-v3.png')] bg-cover bg-[69%_center] shadow-[inset_0_0_0_7px_rgba(238,231,214,.48),0_24px_55px_rgba(24,67,49,.22)] before:absolute before:inset-3 before:border before:border-[#f6edcf]/70 max-[900px]:min-h-[420px] max-[600px]:min-h-[340px]" aria-hidden="true">
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061f20]/90 to-transparent px-8 pb-7 pt-28 text-right font-miraj-of-icarus text-lg uppercase tracking-[.13em] text-[#eef0d8]">Um reino acima das nuvens</div>
            </div>
            <div className="text-center max-[900px]:mx-auto max-[900px]:max-w-[680px]">
              <OrnamentTitle>Além do portão</OrnamentTitle>
              <h2 className="my-7 font-miraj-of-icarus text-[clamp(3rem,5vw,5.2rem)] font-semibold leading-[.84] text-[#18372f]">Um mundo antigo.<br /><span className="text-[#9a732b]">Uma nova passagem.</span></h2>
              <p className="mx-auto max-w-[620px] text-base leading-[1.85] text-[#4d665d]">Miraj of Icarus é um MMORPG de fantasia em reconstrução. Explore terras suspensas, enfrente criaturas lendárias e encontre companheiros para uma jornada que volta a ganhar vida.</p>
              <div className="mt-9 flex flex-wrap justify-center gap-2">
                <GamePlaque>Mundo persistente</GamePlaque>
                <GamePlaque>Jornada em grupo</GamePlaque>
                <GamePlaque>Combate por classes</GamePlaque>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-24 w-[min(1060px,100%)] text-center">
            <OrnamentTitle>Escolha seu caminho</OrnamentTitle>
            <h3 className="mt-5 font-miraj-of-icarus text-[clamp(2.3rem,4vw,3.8rem)] uppercase text-[#18372f]">Oito classes. Uma aventura.</h3>
            <div className="mt-10 grid grid-cols-8 border-y border-[#9a8551] bg-[#082d27] px-7 py-8 shadow-[inset_0_0_0_5px_#145143,0_18px_40px_rgba(28,65,50,.24)] max-[900px]:grid-cols-4 max-[760px]:gap-y-7 max-[480px]:grid-cols-2 max-[480px]:px-2">
              {paths.map((path, index) => (
                <div className="group grid min-h-32 place-items-center content-center" key={path.id}>
                  <Image className="h-auto w-[89px] object-contain" src={`/media/game-ui/classes/bronze/${path.id}${index === 0 ? "-selected" : ""}.png`} alt="" width={256} height={256} />
                  <span className={`font-miraj-of-icarus text-xs uppercase tracking-[.08em] ${index === 0 ? "-mt-2 text-[#70d69d]" : "mt-2 text-[#c7d5ca]"}`}>{path.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionGate>Reconstrução</SectionGate>
        <section className="relative isolate overflow-hidden bg-[#082d27] px-6 pb-28 pt-28 text-white max-[700px]:px-4" id="reconstrucao">
          <div className="absolute inset-0 -z-20 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center opacity-25" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#051f1b_0%,rgba(8,55,45,.88)_50%,#051f1b_100%)]" aria-hidden="true" />
          <div className="mx-auto grid w-[min(1120px,100%)] grid-cols-[1fr_380px] items-center gap-20 max-[900px]:grid-cols-1">
            <div className="text-center max-[900px]:mx-auto max-[900px]:max-w-[680px]">
              <OrnamentTitle light>O retorno de Miraj of Icarus</OrnamentTitle>
              <h2 className="my-7 font-miraj-of-icarus text-[clamp(3rem,5vw,5rem)] font-semibold leading-[.86] text-[#f2f7e9] [text-shadow:0_3px_8px_#041a16]">A memória permanece.<br /><span className="text-[#91e5b4]">A fundação evolui.</span></h2>
              <p className="mx-auto max-w-[690px] leading-[1.85] text-[#d7e3d8]">O mundo é reconstruído sistema por sistema, preservando sua identidade e preparando launcher, cliente e servidores para uma nova geração de viajantes.</p>
              <div className="mt-10 grid grid-cols-3 gap-3 max-[650px]:grid-cols-1">
                {[["Integridade", "Arquivos verificados"], ["Evolução", "Atualizações contínuas"], ["Preservação", "Identidade original"]].map(([title, copy]) => (
                  <div className="border-y border-[#8f7a4b] bg-[#061f1b]/72 px-4 py-6 shadow-[inset_0_0_0_1px_rgba(82,212,132,.08)]" key={title}>
                    <strong className="block font-miraj-of-icarus text-lg uppercase text-[#91e5b4]">{title}</strong><span className="text-sm text-[#c5d4c9]">{copy}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto grid aspect-square w-[min(360px,82vw)] place-items-center before:absolute before:inset-[13%] before:rotate-45 before:border before:border-[#91e5b4]/60 before:bg-[#0a3a35]/65 before:shadow-[0_0_30px_rgba(40,185,111,.2)]">
              <Image className="relative z-10 h-auto w-[78%] drop-shadow-[0_22px_20px_rgba(3,17,28,.65)]" src="/media/branding/miraj-mj-mark-jade.png" alt="Símbolo MJ de Miraj of Icarus" width={1052} height={1167} />
            </div>
          </div>
        </section>

        <SectionGate>Estado dos reinos</SectionGate>
        <section className="bg-[linear-gradient(180deg,#dfe9dc,#f4eedf)] px-6 pb-28 pt-28 text-[#18372f] max-[700px]:px-4" id="reinos">
          <div className="mx-auto w-[min(980px,100%)] text-center">
            <OrnamentTitle>Servidores</OrnamentTitle>
            <h2 className="mt-6 font-miraj-of-icarus text-[clamp(3rem,5vw,5rem)] font-semibold leading-none">Escolha sua passagem.</h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[#506a60]">Acompanhe daqui a disponibilidade dos mundos antes de iniciar o launcher.</p>
            <div className="mt-10 border-y border-[#99834f] bg-[#082d27] p-2 shadow-[0_22px_45px_rgba(27,61,48,.25)]">
              {servers.map(server => (
                <article className="flex min-h-24 items-center justify-between border-b border-[#356655] bg-[linear-gradient(90deg,#0b332b,#12513f,#0b332b)] px-8 text-left last:border-0 max-[600px]:px-4" key={server.id}>
                  <div><span className="text-[.65rem] uppercase tracking-[.2em] text-[#91e5b4]">{server.region}</span><h3 className="font-miraj-of-icarus text-2xl text-white">{server.name}</h3></div>
                  <span className={`font-miraj-of-icarus uppercase tracking-[.12em] ${server.available ? "text-[#8df2ce]" : "text-[#9eafb6]"}`}>{server.available ? "Online" : "Manutenção"}</span>
                </article>
              ))}
              {!serversQuery.isLoading && !servers.length && <p className="py-12 text-center text-[#ced8cb]">Não foi possível consultar os reinos agora.</p>}
            </div>
            <div className="mt-7 flex justify-center"><GamePlaque>{serversQuery.isLoading ? "Consultando reinos" : availableServers ? `${availableServers} reino disponível` : "Reinos indisponíveis"}</GamePlaque></div>
          </div>
        </section>

        <section className="relative isolate flex min-h-[680px] w-full flex-col items-center justify-center overflow-hidden px-6 py-28 text-center text-white" id="download">
          <div className="absolute inset-0 -z-20 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(25,102,72,.24),rgba(4,25,21,.86)_72%),linear-gradient(180deg,rgba(4,25,21,.12),#041d19)]" aria-hidden="true" />
          <Image className="mb-3 h-auto w-[min(720px,90vw)] drop-shadow-[0_10px_16px_rgba(3,17,28,.72)]" src="/media/branding/miraj-of-icarus-wordmark-jade.png" alt="Miraj of Icarus" width={1413} height={673} />
          <OrnamentTitle light>Miraj of Icarus para Windows</OrnamentTitle>
          <h2 className="my-6 font-miraj-of-icarus text-[clamp(3rem,5.4vw,5.5rem)] font-semibold leading-[.84] text-[#f7f3df] [text-shadow:0_3px_12px_#041f1a]">Sua jornada começa<br />pelo launcher.</h2>
          <p className="mb-8 max-w-[580px] leading-7 text-[#e8eee2] [text-shadow:0_2px_8px_#041f1a]">Instale, verifique e mantenha o cliente atualizado antes de atravessar os portões.</p>
          {release ? (
            <>
              <a className={buttonStyles("primary", true)} href={release.launcherUrl}>Baixar launcher para Windows</a>
              <div className="mt-6 flex font-miraj-of-icarus text-sm uppercase tracking-[.08em] text-[#d4dfcf] max-[700px]:flex-col max-[700px]:gap-2">
                <span className="border-r border-[#86764e] px-5 max-[700px]:border-0">Versão {release.version.slice(0, 8)}</span>
                <span className="border-r border-[#86764e] px-5 max-[700px]:border-0">{formatBytes(release.totalSize)}</span>
                <span className="px-5">{new Intl.DateTimeFormat("pt-BR").format(new Date(release.publishedAt))}</span>
              </div>
            </>
          ) : !releaseQuery.isLoading && (
            <div className="border-y border-[#927d4e] bg-[#051f1b]/88 px-9 py-5 shadow-[0_10px_30px_rgba(3,24,20,.45)] backdrop-blur-sm">
              <strong className="block font-miraj-of-icarus text-xl uppercase tracking-[.08em] text-[#91e5b4]">Release em preparação</strong>
              <span className="text-sm text-[#dae3d6]">O download aparecerá quando o canal Alpha estiver disponível.</span>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
