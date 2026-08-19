import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PrestigeEvolution } from "@/components/PrestigeEvolution";
import { buttonStyles } from "@/components/ui/Button";
import { SectionTitlePlaque } from "@/components/ui/SectionTitlePlaque";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/seo";
import { routes } from "@/routes";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "pt-BR",
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: siteConfig.name,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.socialImage.url}`,
    description: siteConfig.description,
    genre: ["MMORPG", "Fantasia"],
    gamePlatform: "PC",
    operatingSystem: "Windows",
    playMode: "MultiPlayer",
    inLanguage: "pt-BR",
  },
] as const;

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
      <JsonLd data={structuredData} />
      <section className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden" id="inicio" aria-labelledby="hero-title">
        <div data-testid="hero-image" className="absolute inset-0 -z-30 animate-hero-arrival bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center max-[700px]:bg-[58%_center]" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_43%,rgba(235,255,226,.05)_0_18%,rgba(5,38,31,.12)_44%,rgba(3,24,20,.82)_100%),linear-gradient(180deg,rgba(2,19,16,.2),transparent_35%,rgba(3,24,20,.82)_100%)]" aria-hidden="true" />
        <SiteHeader />

        <div className="relative flex w-[min(920px,calc(100%-32px))] flex-col items-center pb-20 pt-44 text-center max-[700px]:min-h-[100svh] max-[700px]:self-start max-[700px]:justify-between max-[700px]:pb-4 max-[700px]:pt-4">
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
          <a className="mt-6 hidden place-items-center gap-1 font-miraj-of-icarus text-[.62rem] uppercase tracking-[.2em] text-[#d7e6d7] max-[700px]:grid" href="#classes">
            Escolha seu caminho<span className="text-xl text-[#72d99c]">↓</span>
          </a>
        </div>
        <a className="absolute bottom-6 left-1/2 grid -translate-x-1/2 place-items-center gap-1 font-miraj-of-icarus text-[.62rem] uppercase tracking-[.2em] text-[#d7e6d7] max-[700px]:hidden" href="#classes">
          Escolha seu caminho<span className="text-xl text-[#72d99c]">↓</span>
        </a>
      </section>

      <main>
        <section className="relative isolate overflow-hidden bg-[#052721] px-6 py-6 max-[700px]:px-4 max-[700px]:py-4" id="classes">
          <div className="absolute inset-0 -z-20 bg-[url('/media/landing/classes-hall-v1.webp')] bg-[length:100%_100%] bg-center bg-no-repeat max-[700px]:bg-cover" aria-hidden="true" />
          <SectionTitlePlaque
            title="Personagens"
            description="Escolha uma classe e acompanhe, no mesmo brasão, cada material conquistado do primeiro chamado à lendária Miriamita."
          />
          <PrestigeEvolution />
        </section>

        <section className="relative isolate overflow-hidden bg-[url('/media/landing/news-frontier-v1.webp')] bg-cover bg-center px-6 py-6 text-[#f2f0e2] max-[700px]:bg-[62%_center] max-[700px]:px-4 max-[700px]:py-4" id="noticias" aria-labelledby="news-title">
          <div className="mx-auto w-[min(1200px,100%)]">
            <SectionTitlePlaque title="Notícias" titleId="news-title" />
            <div className="mb-10 mt-1 text-center">
              <Link className="text-sm uppercase tracking-[.12em] text-[#e8d795] underline decoration-[#a8e5bc] underline-offset-8" href={routes.community}>Acompanhar a comunidade</Link>
            </div>

            <div className="grid grid-cols-[1.5fr_.85fr] gap-5 max-[980px]:grid-cols-1">
              {news.map((item, index) => (
                <Link className={`group flex flex-col overflow-hidden bg-[#042a24] shadow-[0_24px_55px_rgba(2,20,16,.35)] ${index === 0 ? "row-span-2 min-h-[660px]" : "min-h-[320px]"} max-[980px]:min-h-[520px]`} href={item.href} key={item.title}>
                  <div className={`relative shrink-0 overflow-hidden ${index === 0 ? "h-[360px]" : "h-[132px]"} max-[980px]:h-[230px]`}>
                    <Image className={`h-full w-full object-cover transition-transform duration-700 group-focus-visible:scale-[1.02] ${index === 1 ? "object-left" : index === 2 ? "object-right" : "object-center"}`} src="/media/landing/news-frontier-v1.webp" alt="Aventureiros reunidos diante do portal de uma cidadela de Miraj" width={1881} height={836} sizes={index === 0 ? "(max-width: 980px) 100vw, 62vw" : "(max-width: 980px) 100vw, 35vw"} />
                  </div>
                  <article className={`flex flex-1 flex-col text-[#f1f0e2] ${index === 0 ? "p-10" : "p-6"} max-[700px]:p-7`}>
                    <p className="text-[.62rem] uppercase tracking-[.18em] text-[#99deb4]">{item.category}</p>
                    <h3 className={`mt-4 font-miraj-of-icarus leading-tight ${index === 0 ? "text-[clamp(2rem,3vw,3.4rem)]" : "text-[clamp(1.25rem,1.65vw,1.8rem)]"}`}>{item.title}</h3>
                    <p className="mt-5 text-sm leading-6 text-[#c6d4ca]">{item.description}</p>
                    <span className="mt-auto pt-7 text-[.65rem] uppercase tracking-[.12em] text-[#dac17c]">Descobrir →</span>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
