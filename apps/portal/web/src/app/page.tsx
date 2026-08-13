"use client";

import Image from "next/image";
import Link from "next/link";
import { useGameServers } from "@/api/game-servers/get-game-servers";
import { useLatestRelease } from "@/api/releases/get-latest-release";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { classHref, gameClasses, prestigeTiers } from "@/data/game-classes";
import { routes } from "@/routes";

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function ChapterTitle({ eyebrow, children, light = false }: { eyebrow: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className={`mb-5 flex items-center justify-center gap-4 font-miraj-of-icarus text-[.68rem] uppercase tracking-[.24em] ${light ? "text-[#a9e9c4]" : "text-[#8b682e]"}`}>
        <i className="h-px w-[min(120px,16vw)] bg-current opacity-55" />
        <span className="size-3 rotate-45 border border-[#d7c387] bg-[#16834f] shadow-[0_0_10px_#28b96f]" />
        {eyebrow}
        <span className="size-3 rotate-45 border border-[#d7c387] bg-[#16834f] shadow-[0_0_10px_#28b96f]" />
        <i className="h-px w-[min(120px,16vw)] bg-current opacity-55" />
      </div>
      <h2 className={`font-miraj-of-icarus text-[clamp(3rem,6.5vw,6.5rem)] font-semibold leading-[.82] tracking-[-.025em] ${light ? "text-[#f4f1df] [text-shadow:0_3px_12px_#031b16]" : "text-[#173b32]"}`}>{children}</h2>
    </div>
  );
}

export default function HomePage() {
  const releaseQuery = useLatestRelease();
  const serverQuery = useGameServers();
  const release = releaseQuery.data ?? null;
  const servers = serverQuery.data ?? [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#041d19]">
      <section className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden" id="inicio" aria-labelledby="hero-title">
        <div data-testid="hero-image" className="absolute inset-0 -z-30 animate-hero-arrival bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center max-[700px]:bg-[58%_center]" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_43%,rgba(235,255,226,.05)_0_18%,rgba(5,38,31,.12)_44%,rgba(3,24,20,.82)_100%),linear-gradient(180deg,rgba(2,19,16,.2),transparent_35%,rgba(3,24,20,.82)_100%)]" aria-hidden="true" />
        <SiteHeader />

        <div className="relative flex w-[min(920px,calc(100%-32px))] flex-col items-center pb-20 pt-44 text-center max-[700px]:pt-32">
          <div className="pointer-events-none absolute left-1/2 top-[47%] -z-10 h-[min(720px,78vw)] w-[min(620px,68vw)] -translate-x-1/2 -translate-y-1/2 rounded-[48%_48%_12%_12%] border border-[#a8e5bc]/25 shadow-[inset_0_0_70px_rgba(40,185,111,.14),0_0_80px_rgba(3,24,20,.65)] before:absolute before:inset-5 before:rounded-[48%_48%_12%_12%] before:border before:border-[#d9c788]/30" aria-hidden="true" />
          <Image className="mb-0 h-auto w-[min(730px,92vw)] drop-shadow-[0_14px_22px_rgba(2,20,17,.8)]" src="/media/branding/miraj-of-icarus-wordmark-jade.png" alt="Miraj of Icarus" width={1413} height={673} priority />
          <p className="-mt-8 font-miraj-of-icarus text-[clamp(.75rem,1.4vw,1rem)] uppercase tracking-[.28em] text-[#b8ecc9] [text-shadow:0_2px_8px_#031b16] max-[600px]:-mt-2">O chamado dos reinos</p>
          <h1 id="hero-title" className="mt-5 font-miraj-of-icarus text-[clamp(3.1rem,7.8vw,7.3rem)] font-semibold leading-[.8] text-[#f6f1d9] [text-shadow:0_4px_3px_#04271f,0_0_22px_#04271f]">O céu não é<br />o limite.</h1>
          <p className="mt-7 max-w-[650px] text-[clamp(1rem,1.6vw,1.25rem)] leading-8 text-[#f3f5eb] [text-shadow:0_2px_8px_#031b16]">Atravesse o grande portal, escolha entre oito caminhos e escreva uma jornada capaz de transformar o próprio brasão.</p>
          <div className="mt-9 flex gap-3 max-[560px]:w-full max-[560px]:flex-col">
            <a className={buttonStyles("primary", true)} href="#classes">Conhecer as classes</a>
            <Link className={buttonStyles("ghost", true)} href={routes.register}>Criar conta</Link>
          </div>
        </div>
        <a className="absolute bottom-6 left-1/2 grid -translate-x-1/2 place-items-center gap-1 font-miraj-of-icarus text-[.62rem] uppercase tracking-[.2em] text-[#d7e6d7]" href="#mundo">
          Atravesse o portal<span className="text-xl text-[#72d99c]">↓</span>
        </a>
      </section>

      <main>
        <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#e8eddd,#f7f0dd_54%,#dbe7d6)] px-6 py-32 text-[#173b32] max-[700px]:px-4 max-[700px]:py-24" id="mundo">
          <div className="absolute inset-x-0 top-0 -z-10 h-28 bg-[linear-gradient(180deg,#041d19,transparent)] opacity-30" aria-hidden="true" />
          <ChapterTitle eyebrow="Além da passagem">Um reino acima das nuvens.</ChapterTitle>
          <div className="mx-auto mt-20 grid w-[min(1180px,100%)] grid-cols-[1.08fr_.92fr] items-center gap-16 max-[900px]:grid-cols-1">
            <div className="relative min-h-[580px] overflow-hidden border-y border-[#8f7540] bg-[url('/media/portal-hero-v3.png')] bg-cover bg-[67%_center] shadow-[0_28px_65px_rgba(30,63,49,.25)] before:absolute before:inset-4 before:border before:border-[#f4ead0]/65 max-[700px]:min-h-[410px]" aria-hidden="true">
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#04241e]/95 via-[#04241e]/48 to-transparent px-8 pb-8 pt-36">
                <p className="text-right font-miraj-of-icarus text-xl uppercase tracking-[.14em] text-[#f4efdc]">Cidadelas, montarias e horizontes livres</p>
              </div>
            </div>
            <div>
              <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#957237]">O mundo de Miraj</p>
              <h3 className="my-6 font-miraj-of-icarus text-[clamp(2.8rem,5vw,5rem)] leading-[.9]">A jornada começa no chão. A verdadeira aventura ganha os céus.</h3>
              <p className="text-lg leading-8 text-[#4c675e]">Miraj of Icarus é um MMORPG de fantasia em reconstrução. Explore regiões suspensas, encontre criaturas lendárias e reúna companheiros para atravessar um mundo persistente.</p>
              <div className="mt-9 grid grid-cols-3 gap-px border-y border-[#a08850] bg-[#a08850] max-[560px]:grid-cols-1">
                {[["08", "caminhos"], ["04", "prestígios"], ["01", "mundo vivo"]].map(([number, label]) => (
                  <div className="bg-[#f1eddb] px-4 py-6 text-center" key={label}><strong className="block font-miraj-of-icarus text-4xl text-[#176347]">{number}</strong><span className="text-xs uppercase tracking-[.14em] text-[#756642]">{label}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-[#052721] px-6 py-32 max-[700px]:px-4 max-[700px]:py-24" id="classes">
          <div className="absolute inset-0 -z-20 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center opacity-[.13]" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(35,129,87,.22),rgba(3,26,22,.97)_68%)]" aria-hidden="true" />
          <ChapterTitle eyebrow="O Salão dos Oito" light>Escolha seu caminho.</ChapterTitle>
          <p className="mx-auto mt-7 max-w-2xl text-center leading-7 text-[#c9d9ce]">Cada classe muda a forma de atravessar o mundo. Conheça sua função, seu ritmo e o brasão que acompanhará toda a jornada.</p>
          <div className="mx-auto mt-16 grid w-[min(1240px,100%)] grid-cols-4 gap-5 max-[950px]:grid-cols-2 max-[520px]:grid-cols-1">
            {gameClasses.map(gameClass => (
              <Link className="group relative min-h-[390px] overflow-hidden border border-[#887341]/60 bg-[linear-gradient(180deg,rgba(8,61,50,.9),rgba(3,28,24,.96))] p-5 text-center shadow-[inset_0_0_0_4px_rgba(39,142,90,.12)] focus-visible:border-[#91e5b4] focus-visible:shadow-[inset_0_0_0_4px_rgba(39,142,90,.2),0_0_24px_rgba(40,185,111,.38)]" href={classHref(gameClass)} key={gameClass.id}>
                <span className="absolute inset-x-7 top-5 h-px bg-gradient-to-r from-transparent via-[#a98d53] to-transparent" />
                <Image className="mx-auto h-52 w-52 object-contain drop-shadow-[0_16px_20px_rgba(1,16,13,.6)]" src={`/media/game-ui/classes/bronze/${gameClass.id}.png`} alt="" width={256} height={256} />
                <p className="font-miraj-of-icarus text-[.64rem] uppercase tracking-[.2em] text-[#7ee2a7]">{gameClass.role}</p>
                <h3 className="mt-2 font-miraj-of-icarus text-4xl text-[#f2eddc]">{gameClass.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[#b9cbbf]">{gameClass.epithet}</p>
                <span className="mt-6 inline-block font-miraj-of-icarus text-[.68rem] uppercase tracking-[.16em] text-[#d2ba7a]">Conhecer a classe →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="overflow-hidden bg-[linear-gradient(180deg,#ececdd,#f8f1de)] px-6 py-32 text-[#183a32] max-[700px]:px-4 max-[700px]:py-24" id="prestigio">
          <ChapterTitle eyebrow="Ascensão do brasão">Sua força tem nível.<br />Sua jornada tem prestígio.</ChapterTitle>
          <p className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-[#526b61]">O nível representa o desenvolvimento do personagem dentro do jogo. O prestígio registra o caminho percorrido e transforma visualmente o brasão da classe — de Bronze até Jade.</p>
          <div className="mx-auto mt-20 grid w-[min(1200px,100%)] grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
            {prestigeTiers.map((tier, index) => (
              <article className="relative border-y border-[#907640] bg-[#f4efde] px-6 pb-8 pt-4 text-center shadow-[0_18px_35px_rgba(31,61,49,.12)]" key={tier.id}>
                <span className="absolute left-4 top-4 font-miraj-of-icarus text-xs text-[#9b824e]">0{index + 1}</span>
                <Image className="mx-auto h-48 w-48 object-contain" src={`/media/game-ui/classes/${tier.id}/warrior${index === 3 ? "-selected" : ""}.png`} alt={`Brasão Guerreiro em prestígio ${tier.name}`} width={256} height={256} />
                <p className="font-miraj-of-icarus text-[.65rem] uppercase tracking-[.18em] text-[#16834f]">{tier.stage}</p>
                <h3 className="my-2 font-miraj-of-icarus text-4xl">{tier.name}</h3>
                <p className="text-sm leading-6 text-[#607268]">{tier.description}</p>
              </article>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-4xl border-y border-[#967b45] bg-[#0a3a35] px-8 py-7 text-center text-[#e5eee4] shadow-[inset_0_0_0_4px_rgba(40,185,111,.13)]">
            <strong className="font-miraj-of-icarus text-xl uppercase tracking-[.08em] text-[#a1e5bb]">Uma identidade que cresce com você</strong>
            <p className="mt-2 text-sm leading-6 text-[#c8d8cc]">O estado iluminado indica apenas a seleção na interface. Bronze, Prata, Ouro e Jade representam os quatro estágios reais da progressão visual.</p>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-[#052720] px-6 py-28 text-center text-white max-[700px]:px-4" id="reinos">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(51,150,99,.25),transparent_48%)]" aria-hidden="true" />
          <ChapterTitle eyebrow="Estado dos reinos" light>A passagem está disponível?</ChapterTitle>
          <div className="mx-auto mt-12 w-[min(850px,100%)] border-y border-[#8d794d] bg-[#041d19]/80 p-2">
            {servers.map(server => (
              <article className="flex min-h-24 items-center justify-between border-b border-[#326353] px-7 text-left last:border-0 max-[520px]:items-start max-[520px]:flex-col max-[520px]:justify-center" key={server.id}>
                <div><span className="text-[.65rem] uppercase tracking-[.2em] text-[#85dca8]">{server.region}</span><h3 className="font-miraj-of-icarus text-2xl">{server.name}</h3></div>
                <span className={`font-miraj-of-icarus text-sm uppercase tracking-[.12em] ${server.available ? "text-[#91efb8]" : "text-[#b6aaa1]"}`}>{server.available ? "Online" : "Manutenção"}</span>
              </article>
            ))}
            {!serverQuery.isLoading && !servers.length && <p className="py-10 text-[#c8d6cb]">Não foi possível consultar os reinos agora.</p>}
          </div>
        </section>

        <section className="relative isolate grid min-h-[780px] place-items-center overflow-hidden px-6 py-28 text-center" id="download">
          <div className="absolute inset-0 -z-20 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,25,21,.62),rgba(3,25,21,.92)),radial-gradient(circle_at_50%_38%,rgba(45,157,99,.18),transparent_42%)]" aria-hidden="true" />
          <div className="max-w-3xl">
            <Image className="mx-auto h-auto w-[min(680px,92vw)]" src="/media/branding/miraj-of-icarus-wordmark-jade.png" alt="Miraj of Icarus" width={1413} height={673} />
            <ChapterTitle eyebrow="Para Windows" light>A próxima passagem começa aqui.</ChapterTitle>
            <p className="mx-auto mt-7 max-w-xl leading-7 text-[#d9e5da]">O launcher instala, verifica e mantém o cliente preparado antes de conectar sua conta aos reinos.</p>
            <div className="mt-9">
              {release ? <a className={buttonStyles("primary", true)} href={release.launcherUrl}>Baixar launcher</a> : <span className={buttonStyles("primary", true)} aria-disabled="true">Release em preparação</span>}
            </div>
            {release && <p className="mt-5 font-miraj-of-icarus text-xs uppercase tracking-[.12em] text-[#c9d8ca]">Versão {release.version.slice(0, 8)} · {formatBytes(release.totalSize)} · {new Intl.DateTimeFormat("pt-BR").format(new Date(release.publishedAt))}</p>}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
