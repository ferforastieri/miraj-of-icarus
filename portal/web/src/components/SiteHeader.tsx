import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/routes";

type Props = { compact?: boolean };

export function SiteHeader({ compact = false }: Props) {
  return (
    <header className={cn(
      "z-20 mx-auto w-[min(1180px,calc(100%-56px))] pt-8 max-[620px]:w-[calc(100%-30px)] max-[620px]:pt-5",
      compact ? "relative" : "absolute inset-x-0 top-0",
    )}>
      <nav className="relative mt-7 grid h-[58px] grid-cols-[1fr_220px_1fr] items-center border border-ancient-gold/45 border-x-ancient-gold/25 bg-gradient-to-b from-[rgba(25,31,34,.94)] to-[rgba(7,11,16,.93)] shadow-[0_20px_60px_rgba(0,0,0,.5),inset_0_1px_rgba(217,228,232,.1)] max-[900px]:grid-cols-[1fr_150px_1fr] max-[620px]:h-[50px] max-[620px]:grid-cols-[1fr_120px_1fr]" aria-label="Navegação principal">
        <i className="absolute -left-6 inset-y-2 w-6 -skew-y-[25deg] border-y border-l border-ancient-gold/40" aria-hidden="true" />
        <i className="absolute -right-6 inset-y-2 w-6 skew-y-[25deg] border-y border-r border-ancient-gold/40" aria-hidden="true" />
        <div className="flex items-center gap-[clamp(18px,3vw,42px)] px-8 text-xs font-semibold uppercase tracking-[.16em] text-mist max-[900px]:gap-4 max-[900px]:px-5 max-[620px]:px-3 [&_a]:transition-colors [&_a]:hover:text-moonsteel">
          <Link className="max-[900px]:hidden" href={routes.game}>O jogo</Link>
          <Link className="max-[900px]:hidden" href={routes.reconstruction}>Reconstrução</Link>
          <span className="hidden max-[900px]:block max-[620px]:hidden">Portal</span>
        </div>
        <Link className="absolute -top-[50px] left-1/2 grid w-[190px] -translate-x-1/2 justify-items-center drop-shadow-[0_16px_18px_rgba(0,0,0,.65)] max-[620px]:-top-8 max-[620px]:w-[130px]" href={routes.home} aria-label="Masicarus — início">
          <Image className="size-[106px] object-contain max-[620px]:size-[75px]" src="/media/mark.png" alt="" width={126} height={126} priority />
          <span className="-mt-2.5 font-display text-base tracking-[.28em] text-[#edf8fb] [text-shadow:0_2px_12px_#000] max-[620px]:text-xs">MASICARUS</span>
        </Link>
        <div className="flex items-center justify-end gap-[clamp(18px,3vw,42px)] px-8 text-xs font-semibold uppercase tracking-[.16em] text-mist max-[900px]:gap-4 max-[900px]:px-5 max-[620px]:pr-2 max-[620px]:pl-8 [&_a]:transition-colors [&_a]:hover:text-moonsteel">
          <Link className="max-[900px]:hidden" href={routes.realms}>Reinos</Link>
          <Link className="max-[900px]:hidden" href={routes.download}>Download</Link>
          <Link className="text-ancient-gold max-[620px]:ml-auto max-[620px]:text-[.58rem] max-[620px]:tracking-[.1em]" href={routes.panel}>Painel</Link>
        </div>
      </nav>
    </header>
  );
}
