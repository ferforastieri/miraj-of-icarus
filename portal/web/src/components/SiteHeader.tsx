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
        <div className="col-start-1 flex items-center justify-end max-[700px]:pr-0">
          <Link className={navItem} href={routes.home}>Início</Link>
          <Link className={`${navItem} max-[700px]:hidden`} href={routes.game}>O jogo</Link>
        </div>

        <Link className="absolute -top-9 left-1/2 z-20 grid size-[138px] -translate-x-1/2 place-items-center drop-shadow-[0_12px_12px_rgba(3,19,31,.72)] max-[900px]:-top-6 max-[900px]:size-[112px] max-[700px]:-top-3 max-[700px]:size-[80px]" href={routes.home} aria-label="Masicarus — início">
          <Image className="size-full object-contain" src="/media/branding/masicarus-feather-mark.png" alt="Masicarus" width={1254} height={1254} priority />
        </Link>

        <div className="col-start-3 flex items-center max-[700px]:justify-end max-[700px]:pl-0">
          <Link className={`${navItem} max-[700px]:hidden`} href={routes.realms}>Reinos</Link>
          <Link className={navItem} href={routes.download}>Download</Link>
        </div>
      </nav>
    </header>
  );
}
