import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/routes";

type Props = { compact?: boolean };

const navItem = "grid min-h-[54px] min-w-[154px] place-items-center bg-[url('/media/game-ui/buttons/default.png')] bg-[length:100%_100%] bg-center bg-no-repeat px-7 font-masicarus text-[.78rem] font-semibold uppercase tracking-[.06em] text-[#d5e2e7] [text-shadow:0_2px_2px_#02070b] transition-[filter] hover:bg-[url('/media/game-ui/buttons/focused.png')] hover:text-white hover:drop-shadow-[0_0_8px_rgba(25,130,255,.72)] focus-visible:bg-[url('/media/game-ui/buttons/focused.png')] max-[1050px]:min-w-[130px] max-[900px]:min-w-[112px] max-[900px]:px-4 max-[700px]:min-w-[104px]";

export function SiteHeader({ compact = false }: Props) {
  return (
    <header className={cn(
      "z-30 mx-auto w-[min(1180px,calc(100%-50px))] pt-6 max-[700px]:w-[calc(100%-20px)] max-[700px]:pt-3",
      compact ? "relative" : "absolute inset-x-0 top-0",
    )}>
      <div className="mb-3 flex justify-end gap-5 pr-2 font-masicarus text-[.68rem] font-semibold uppercase tracking-[.08em] text-[#e2edf0] [text-shadow:0_1px_5px_#061322] max-[700px]:hidden">
        <Link className="hover:text-frost" href={routes.panel}>Entrar</Link>
        <Link className="hover:text-frost" href={`${routes.panel}?modo=cadastro`}>Criar conta</Link>
      </div>

      <nav className="relative grid h-[64px] grid-cols-[1fr_270px_1fr] items-center max-[1050px]:grid-cols-[1fr_220px_1fr] max-[900px]:grid-cols-[1fr_180px_1fr] max-[700px]:h-[54px] max-[700px]:grid-cols-[1fr_104px_1fr]" aria-label="Navegação principal">
        <div className="flex items-center justify-end gap-0 pr-3 max-[700px]:pr-0">
          <Link className={navItem} href={routes.home}>Início</Link>
          <Link className={`${navItem} max-[700px]:hidden`} href={routes.game}>O jogo</Link>
        </div>

        <Link className="absolute -top-9 left-1/2 z-20 grid -translate-x-1/2 justify-items-center drop-shadow-[0_10px_10px_rgba(3,19,31,.75)] max-[700px]:-top-1" href={routes.home} aria-label="Masicarus — início">
          <Image className="h-auto w-[300px] max-w-none object-contain max-[1050px]:w-[245px] max-[900px]:w-[205px] max-[700px]:w-[126px]" src="/media/branding/masicarus-wordmark.png" alt="Masicarus" width={1936} height={399} priority />
        </Link>

        <div className="flex items-center gap-0 pl-3 max-[700px]:justify-end max-[700px]:pl-0">
          <Link className={`${navItem} max-[700px]:hidden`} href={routes.realms}>Reinos</Link>
          <Link className={navItem} href={routes.download}>Download</Link>
          <Link className={`${navItem} max-[900px]:hidden`} href={routes.panel}>Painel</Link>
        </div>
      </nav>
    </header>
  );
}
