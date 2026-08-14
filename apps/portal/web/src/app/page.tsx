import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PrestigeEvolution } from "@/components/PrestigeEvolution";
import { buttonStyles } from "@/components/ui/Button";
import { routes } from "@/routes";

const news = [
  {
    category: "Diário de reconstrução",
    title: "O Salão dos Oito recebe uma progressão completa até o nível 110.",
    description: "Classes, níveis e materiais de prestígio agora contam uma única história visual, do Bronze à Miriamita.",
    href: routes.classes,
  },
  {
    category: "Mundo",
    title: "Reinos se preparam para clãs, guerras e territórios.",
    description: "Conheça a estrutura planejada para as disputas que vão mover alianças pelo mapa.",
    href: routes.realms,
  },
  {
    category: "Desenvolvimento",
    title: "Portal, launcher e Lobby formam a mesma passagem.",
    description: "A reconstrução aproxima conta, personagens, atualização e entrada no jogo em uma jornada contínua.",
    href: routes.game,
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#041d19]">
      <section className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden" id="inicio" aria-labelledby="hero-title">
        <div data-testid="hero-image" className="absolute inset-0 -z-30 animate-hero-arrival bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center max-[700px]:bg-[58%_center]" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_43%,rgba(235,255,226,.05)_0_18%,rgba(5,38,31,.12)_44%,rgba(3,24,20,.82)_100%),linear-gradient(180deg,rgba(2,19,16,.2),transparent_35%,rgba(3,24,20,.82)_100%)]" aria-hidden="true" />
        <SiteHeader />

        <div className="relative flex w-[min(920px,calc(100%-32px))] flex-col items-center pb-20 pt-44 text-center max-[700px]:pt-32">
          <div className="pointer-events-none absolute left-1/2 top-[47%] -z-10 h-[min(720px,78vw)] w-[min(620px,68vw)] -translate-x-1/2 -translate-y-1/2 rounded-[48%_48%_12%_12%] border border-[#a8e5bc]/25 shadow-[inset_0_0_70px_rgba(40,185,111,.14),0_0_80px_rgba(3,24,20,.65)] before:absolute before:inset-5 before:rounded-[48%_48%_12%_12%] before:border before:border-[#d9c788]/30" aria-hidden="true" />
          <p className="mb-2 font-miraj-of-icarus text-[clamp(.7rem,1.3vw,.92rem)] uppercase tracking-[.32em] text-[#b8ecc9] [text-shadow:0_2px_8px_#031b16]">O chamado dos reinos</p>
          <Image className="mb-0 h-auto w-[min(730px,92vw)] drop-shadow-[0_14px_22px_rgba(2,20,17,.8)]" src="/media/branding/miraj-of-icarus-wordmark-jade.png" alt="Miraj of Icarus" width={1413} height={673} priority />
          <h1 id="hero-title" className="mt-5 font-miraj-of-icarus text-[clamp(3.1rem,7.8vw,7.3rem)] font-semibold leading-[.8] text-[#f6f1d9] [text-shadow:0_4px_3px_#04271f,0_0_22px_#04271f]">O céu não é<br />o limite.</h1>
          <p className="mt-7 max-w-[650px] text-[clamp(1rem,1.6vw,1.25rem)] leading-8 text-[#f3f5eb] [text-shadow:0_2px_8px_#031b16]">Atravesse o grande portal, escolha entre oito caminhos e escreva uma jornada capaz de transformar o próprio brasão.</p>
          <div className="mt-9 grid w-[min(900px,100%)] grid-cols-3 gap-3 max-[760px]:w-full max-[760px]:grid-cols-1">
            <a className={`${buttonStyles("primary", true)} w-full`} style={{ minWidth: 0 }} href="#classes">Conhecer as classes</a>
            <Link className={`${buttonStyles("secondary", true)} w-full`} style={{ minWidth: 0 }} href={routes.download}>Download</Link>
            <Link className={`${buttonStyles("ghost", true)} w-full`} style={{ minWidth: 0 }} href={routes.register}>Criar conta</Link>
          </div>
        </div>
        <a className="absolute bottom-6 left-1/2 grid -translate-x-1/2 place-items-center gap-1 font-miraj-of-icarus text-[.62rem] uppercase tracking-[.2em] text-[#d7e6d7]" href="#classes">
          Escolha seu caminho<span className="text-xl text-[#72d99c]">↓</span>
        </a>
      </section>

      <main>
        <section className="relative isolate overflow-hidden bg-[#052721] px-6 py-32 max-[700px]:px-4 max-[700px]:py-24" id="classes">
          <div className="absolute inset-0 -z-20 bg-[url('/media/landing/classes-hall-v1.webp')] bg-[length:100%_100%] bg-center bg-no-repeat" aria-hidden="true" />
          <header className="mx-auto w-[min(1020px,100%)] px-8 py-7 text-center max-[700px]:px-5 max-[700px]:py-6">
            <p className="font-miraj-of-icarus text-[.65rem] uppercase tracking-[.22em] text-[#174d3d] [text-shadow:0_1px_4px_#eef0df]">O Salão dos Oito</p>
            <h2 className="mt-3 font-miraj-of-icarus text-[clamp(2.15rem,4vw,4rem)] font-semibold leading-none text-[#082f28] [text-shadow:0_2px_5px_#f5f1df]">Escolha seu caminho. Conquiste seu prestígio.</h2>
            <p className="mx-auto mt-5 max-w-3xl leading-7 text-[#173b32] [text-shadow:0_1px_4px_#f5f1df]">Escolha uma classe e acompanhe, no mesmo brasão, cada material conquistado do primeiro chamado à lendária Miriamita.</p>
          </header>
          <PrestigeEvolution />
        </section>

        <section className="relative isolate overflow-hidden bg-[url('/media/landing/news-frontier-v1.webp')] bg-cover bg-center px-6 py-28 text-[#f2f0e2] max-[700px]:bg-[62%_center] max-[700px]:px-4 max-[700px]:py-20" id="noticias" aria-labelledby="news-title">
          <div className="mx-auto w-[min(1200px,100%)]">
            <header className="mb-12 flex items-end justify-between gap-8 border-b border-[#d8c481] pb-7 [text-shadow:0_2px_7px_#031b16] max-[700px]:block">
              <div>
                <p className="font-miraj-of-icarus text-[.66rem] uppercase tracking-[.22em] text-[#b9f0cb]">Crônicas do mundo</p>
                <h2 id="news-title" className="mt-2 font-miraj-of-icarus text-[clamp(2.6rem,5vw,5rem)] leading-none">Notícias de Miraj</h2>
              </div>
              <Link className="text-sm uppercase tracking-[.12em] text-[#e8d795] underline decoration-[#a8e5bc] underline-offset-8 max-[700px]:mt-5 max-[700px]:inline-block" href={routes.community}>Acompanhar a comunidade</Link>
            </header>

            <div className="grid grid-cols-[1.55fr_.85fr] gap-5 max-[900px]:grid-cols-1">
              <Link className="group relative min-h-[600px] overflow-hidden border-y border-[#9c824b] bg-[#092d27] shadow-[0_24px_55px_rgba(2,20,16,.35)] max-[700px]:min-h-[620px]" href={news[0].href}>
                <Image className="absolute inset-x-0 top-0 h-[58%] w-full object-cover object-center transition-transform duration-700 group-focus-visible:scale-[1.02]" src="/media/landing/news-frontier-v1.webp" alt="Aventureiros reunidos diante do portal de uma cidadela de Miraj" width={1881} height={836} sizes="(max-width: 900px) 100vw, 65vw" />
                <span className="absolute inset-4 border border-[#efe0ad]/45" aria-hidden="true" />
                <article className="absolute inset-x-0 bottom-0 z-10 min-h-[44%] bg-[#042a24] p-10 text-[#f1f0e2] max-[700px]:p-8">
                  <p className="text-[.65rem] uppercase tracking-[.2em] text-[#9ce7b8]">{news[0].category}</p>
                  <h3 className="mt-4 font-miraj-of-icarus text-[clamp(2.2rem,4vw,4.4rem)] leading-[.92]">{news[0].title}</h3>
                  <p className="mt-5 max-w-xl leading-7 text-[#d3ddd4]">{news[0].description}</p>
                  <span className="mt-7 inline-block text-xs uppercase tracking-[.14em] text-[#e0c986]">Ler atualização →</span>
                </article>
              </Link>

              <div className="grid gap-5">
                {news.slice(1).map(item => (
                  <Link className="jade-card group flex min-h-[270px] flex-col justify-end" href={item.href} key={item.title}>
                    <article>
                      <p className="text-[.62rem] uppercase tracking-[.18em] text-[#99deb4]">{item.category}</p>
                      <h3 className="mt-3 font-miraj-of-icarus text-[clamp(1.55rem,2.3vw,2.35rem)] leading-tight text-[#f1eddd]">{item.title}</h3>
                      <p className="mt-4 text-sm leading-6 text-[#b9cbc0]">{item.description}</p>
                      <span className="mt-5 inline-block text-[.65rem] uppercase tracking-[.12em] text-[#dac17c]">Descobrir →</span>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
