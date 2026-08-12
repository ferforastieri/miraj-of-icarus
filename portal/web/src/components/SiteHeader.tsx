import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/routes";

type Props = { compact?: boolean };

const navItem = "relative z-10 grid min-h-[66px] min-w-[154px] place-items-center px-7 font-miraj-of-icarus text-[.78rem] font-semibold uppercase tracking-[.08em] text-[#d5e2e7] [text-shadow:0_2px_2px_#02070b] transition-[color,filter] after:absolute after:inset-x-6 after:bottom-[10px] after:h-px after:origin-center after:scale-x-0 after:bg-[linear-gradient(90deg,transparent,#6edcff,transparent)] after:transition-transform hover:text-white hover:drop-shadow-[0_0_7px_rgba(63,199,246,.7)] hover:after:scale-x-100 focus-visible:text-white focus-visible:after:scale-x-100 max-[1050px]:min-w-[130px] max-[900px]:min-w-[112px] max-[900px]:px-4 max-[700px]:min-w-[104px]";

export function SiteHeader({ compact = false }: Props) {
  return (
    <header className={cn(
      "z-30 mx-auto w-[min(1180px,calc(100%-50px))] pt-6 max-[700px]:w-[calc(100%-20px)] max-[700px]:pt-3",
      compact ? "relative" : "absolute inset-x-0 top-0",
    )}>
      <div className="mb-3 flex justify-end gap-5 pr-2 font-miraj-of-icarus text-[.68rem] font-semibold uppercase tracking-[.08em] text-[#e2edf0] [text-shadow:0_1px_5px_#061322] max-[700px]:hidden">
        <Link className="hover:text-frost" href={routes.panel}>Entrar</Link>
        <Link className="hover:text-frost" href={`${routes.panel}?modo=cadastro`}>Criar conta</Link>
      </div>

      <nav className="relative grid h-[72px] grid-cols-[1fr_240px_1fr] items-center before:absolute before:inset-x-0 before:top-1/2 before:h-[66px] before:-translate-y-1/2 before:border-y before:border-[#9eb8c3] before:bg-[linear-gradient(180deg,rgba(239,249,251,.22)_0%,rgba(23,58,81,.96)_8%,rgba(6,29,47,.98)_48%,rgba(13,45,66,.98)_90%,rgba(213,232,237,.26)_100%)] before:shadow-[inset_0_2px_0_rgba(255,255,255,.17),inset_0_-2px_0_rgba(0,0,0,.48),0_8px_22px_rgba(2,18,29,.48)] after:absolute after:inset-x-[-18px] after:top-1/2 after:h-[50px] after:-translate-y-1/2 after:border-y after:border-[#b38a3e]/65 after:[clip-path:polygon(1.5%_0,98.5%_0,100%_50%,98.5%_100%,1.5%_100%,0_50%)] max-[1050px]:grid-cols-[1fr_200px_1fr] max-[900px]:grid-cols-[1fr_160px_1fr] max-[700px]:h-[58px] max-[700px]:grid-cols-[1fr_92px_1fr] max-[700px]:before:h-[54px] max-[700px]:after:h-[42px]" aria-label="Navegação principal">
        <div className="col-start-1 flex items-center justify-end max-[700px]:pr-0">
          <Link className={navItem} href={routes.home}>Início</Link>
          <Link className={`${navItem} max-[700px]:hidden`} href={routes.game}>O jogo</Link>
        </div>

        <Link className="absolute -top-12 left-1/2 z-20 grid size-[166px] -translate-x-1/2 place-items-center before:absolute before:inset-[12px] before:-z-10 before:rotate-45 before:border before:border-[#d3e4e9]/70 before:bg-[linear-gradient(135deg,#173c55,#071d30_62%,#b38738)] before:shadow-[inset_0_0_0_5px_rgba(5,24,40,.8),0_12px_24px_rgba(3,19,31,.65)] after:absolute after:inset-[22px] after:-z-10 after:rotate-45 after:border after:border-[#b88e43]/65 after:bg-[#08233a] max-[900px]:-top-8 max-[900px]:size-[132px] max-[700px]:-top-4 max-[700px]:size-[92px]" href={routes.home} aria-label="Miraj of Icarus — início">
          <Image className="size-full object-contain drop-shadow-[0_9px_8px_rgba(2,15,25,.75)]" src="/media/branding/miraj-mj-mark.png" alt="" width={1059} height={1125} priority />
        </Link>

        <div className="col-start-3 flex items-center max-[700px]:justify-end max-[700px]:pl-0">
          <Link className={`${navItem} max-[700px]:hidden`} href={routes.realms}>Reinos</Link>
          <Link className={navItem} href={routes.download}>Download</Link>
        </div>
      </nav>
    </header>
  );
}
