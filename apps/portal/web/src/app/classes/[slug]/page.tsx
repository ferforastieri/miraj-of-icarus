import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { classHref, findGameClass, gameClasses, prestigeTiers } from "@/data/game-classes";
import { routes } from "@/routes";

export function generateStaticParams() {
  return gameClasses.map(gameClass => ({ slug: gameClass.slug }));
}

export default async function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gameClass = findGameClass(slug);
  if (!gameClass) notFound();

  const index = gameClasses.findIndex(item => item.id === gameClass.id);
  const previous = gameClasses[(index - 1 + gameClasses.length) % gameClasses.length];
  const next = gameClasses[(index + 1) % gameClasses.length];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#041d19]">
      <section className="relative isolate min-h-[900px] overflow-hidden px-6 pb-24 pt-52 max-[700px]:min-h-0 max-[700px]:px-4 max-[700px]:pb-20 max-[700px]:pt-32">
        <div className="absolute inset-0 -z-30 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center opacity-50" aria-hidden="true" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_44%,rgba(47,162,102,.19),transparent_31%),linear-gradient(90deg,#031b17_0_35%,rgba(3,27,23,.72)_62%,#031b17_100%)]" aria-hidden="true" />
        <SiteHeader />
        <div className="mx-auto grid w-[min(1180px,100%)] grid-cols-[.9fr_1.1fr] items-center gap-12 max-[850px]:grid-cols-1 max-[850px]:text-center">
          <div>
            <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#8ee5b0]">Caminho de classe · {gameClass.role}</p>
            <h1 className="my-5 font-miraj-of-icarus text-[clamp(4.5rem,10vw,9rem)] font-semibold leading-[.72] text-[#f6f1de] [text-shadow:0_4px_18px_#021511] max-[500px]:text-[3.25rem]">{gameClass.name}</h1>
            <p className="font-miraj-of-icarus text-[clamp(1.3rem,2.5vw,2rem)] text-[#d6bc7d]">{gameClass.epithet}</p>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#d7e3d8] max-[850px]:mx-auto">{gameClass.summary}</p>
            <div className="mt-9 flex gap-3 max-[850px]:justify-center max-[520px]:flex-col">
              <Link className={buttonStyles("primary", true)} href={routes.register}>Escolher este caminho</Link>
              <Link className={buttonStyles("ghost", true)} href={routes.classes}>Ver todas as classes</Link>
            </div>
          </div>
          <div className="relative grid min-h-[580px] place-items-center max-[700px]:min-h-[390px]">
            <div className="absolute size-[72%] rotate-45 border border-[#a9dcb9]/20 bg-[#0c4b3c]/16 shadow-[0_0_65px_rgba(40,185,111,.18)]" aria-hidden="true" />
            <Image className="relative h-auto w-[min(540px,88vw)] object-contain drop-shadow-[0_30px_35px_rgba(1,13,11,.75)]" src={`/media/game-ui/classes/jade/${gameClass.id}-selected.png`} alt={`Brasão Jade de ${gameClass.name}`} width={256} height={256} priority />
          </div>
        </div>
      </section>

      <main>
        <section className="bg-[linear-gradient(180deg,#e9ecdc,#f7f0dd)] px-6 py-28 text-[#183b32] max-[700px]:px-4 max-[700px]:py-20">
          <div className="mx-auto grid w-[min(1100px,100%)] grid-cols-[.9fr_1.1fr] gap-20 max-[850px]:grid-cols-1 max-[850px]:gap-12">
            <div>
              <p className="font-miraj-of-icarus text-xs uppercase tracking-[.2em] text-[#8d6c32]">Identidade</p>
              <h2 className="mt-5 font-miraj-of-icarus text-[clamp(3rem,5vw,5.2rem)] leading-[.86]">Como é seguir este caminho?</h2>
              <p className="mt-7 text-lg leading-8 text-[#526b61]">{gameClass.calling}</p>
            </div>
            <dl className="grid grid-cols-2 border-y border-[#9a804a] bg-[#f2eedc] max-[520px]:grid-cols-1">
              {[["Função", gameClass.role], ["Alcance", gameClass.range], ["Ritmo", gameClass.rhythm], ["Especialidade", gameClass.specialty]].map(([term, value]) => (
                <div className="border-b border-r border-[#b9aa7d] px-7 py-8 last:border-b-0" key={term}>
                  <dt className="text-[.65rem] uppercase tracking-[.18em] text-[#8f743d]">{term}</dt>
                  <dd className="mt-2 font-miraj-of-icarus text-2xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-[#052720] px-6 py-28 text-center max-[700px]:px-4 max-[700px]:py-20">
          <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#92e5b2]">Ascensão do brasão</p>
          <h2 className="mx-auto mt-5 max-w-4xl font-miraj-of-icarus text-[clamp(3.2rem,6vw,6rem)] leading-[.84] text-[#f4efdc]">Uma identidade. Quatro momentos.</h2>
          <div className="mx-auto mt-16 grid w-[min(1120px,100%)] grid-cols-4 gap-3 max-[850px]:grid-cols-2 max-[480px]:grid-cols-1">
            {prestigeTiers.map(tier => (
              <article className="border-y border-[#8e7848] bg-[#072f28] px-4 pb-7 pt-3" key={tier.id}>
                <Image className="mx-auto size-52 object-contain" src={`/media/game-ui/classes/${tier.id}/${gameClass.id}.png`} alt={`Prestígio ${tier.name}`} width={256} height={256} />
                <h3 className="font-miraj-of-icarus text-3xl text-[#f1ebda]">{tier.name}</h3>
                <p className="mt-2 text-sm text-[#aacab7]">{tier.stage}</p>
              </article>
            ))}
          </div>
        </section>

        <nav className="grid grid-cols-2 bg-[#eee9d8] text-[#173a31]" aria-label="Outras classes">
          <Link className="border-r border-[#9c8755] px-8 py-12 text-left focus-visible:bg-[#dce8d9] max-[600px]:px-4" href={classHref(previous)}><span className="text-xs uppercase tracking-[.16em] text-[#8c733e]">← Classe anterior</span><strong className="mt-2 block font-miraj-of-icarus text-[clamp(1.8rem,4vw,3.5rem)]">{previous.name}</strong></Link>
          <Link className="px-8 py-12 text-right focus-visible:bg-[#dce8d9] max-[600px]:px-4" href={classHref(next)}><span className="text-xs uppercase tracking-[.16em] text-[#8c733e]">Próxima classe →</span><strong className="mt-2 block font-miraj-of-icarus text-[clamp(1.8rem,4vw,3.5rem)]">{next.name}</strong></Link>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
