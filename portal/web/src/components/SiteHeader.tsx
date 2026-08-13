import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/routes";

type Props = { compact?: boolean };

const navItem = "relative z-10 grid min-h-[58px] min-w-[176px] place-items-center bg-[url('/media/game-ui/jade/button-default.png')] bg-[length:100%_100%] bg-center bg-no-repeat px-8 font-miraj-of-icarus text-[.78rem] font-semibold uppercase tracking-[.08em] text-[#e0e9df] [text-shadow:0_2px_2px_#041b16] focus:bg-[url('/media/game-ui/jade/button-focused.png')] focus:text-white focus:drop-shadow-[0_0_7px_rgba(40,185,111,.7)] focus-visible:bg-[url('/media/game-ui/jade/button-focused.png')] max-[1050px]:min-w-[150px] max-[900px]:min-w-[126px] max-[900px]:px-5 max-[700px]:min-w-[118px] max-[700px]:px-3";

const accountItem = "grid min-h-9 min-w-[116px] place-items-center bg-[url('/media/game-ui/jade/button-default.png')] bg-[length:100%_100%] bg-center bg-no-repeat px-5 focus:bg-[url('/media/game-ui/jade/button-focused.png')] focus:text-white focus:drop-shadow-[0_0_7px_rgba(40,185,111,.7)] focus-visible:bg-[url('/media/game-ui/jade/button-focused.png')]";

export function SiteHeader({ compact = false }: Props) {
  return (
    <header className={cn(
      "z-30 w-full pt-6 max-[700px]:pt-3",
      compact ? "relative border-b border-[#8b794f]/70 bg-[linear-gradient(180deg,rgba(5,47,39,.88),rgba(3,28,24,.95)),url('/media/portal-hero-v3.png')] bg-cover bg-top shadow-[0_12px_28px_rgba(2,24,20,.38)]" : "absolute inset-x-0 top-0",
    )}>
      <div className="mb-1 flex justify-end gap-1 pr-5 font-miraj-of-icarus text-[.64rem] font-semibold uppercase tracking-[.08em] text-[#eee7d6] [text-shadow:0_1px_5px_#061d18] max-[700px]:hidden">
        <Link className={accountItem} href={routes.login}>Entrar</Link>
        <Link className={accountItem} href={routes.register}>Criar conta</Link>
      </div>

      <nav className="relative grid h-[92px] grid-cols-[1fr_240px_1fr] items-center max-[1050px]:grid-cols-[1fr_200px_1fr] max-[900px]:h-[82px] max-[900px]:grid-cols-[1fr_160px_1fr] max-[700px]:h-[68px] max-[700px]:grid-cols-[1fr_92px_1fr]" aria-label="Navegação principal">
        <div className="col-start-1 flex items-center justify-end max-[700px]:hidden">
          <Link className={navItem} href={routes.home}>Início</Link>
          <Link className={`${navItem} max-[700px]:hidden`} href={routes.game}>O jogo</Link>
        </div>

        <Link className="absolute -top-[72px] left-1/2 z-20 grid h-[224px] w-[190px] -translate-x-1/2 place-items-center max-[900px]:-top-[53px] max-[900px]:h-[184px] max-[900px]:w-[156px] max-[700px]:-top-[29px] max-[700px]:h-[126px] max-[700px]:w-[108px]" href={routes.home} aria-label="Miraj of Icarus — início">
          <Image className="absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_10px_14px_rgba(2,24,20,.62)]" src="/media/branding/miraj-header-medallion.png" alt="" width={983} height={1204} priority />
          <Image className="relative z-10 h-[82%] w-[82%] object-contain drop-shadow-[0_8px_7px_rgba(2,24,20,.78)]" src="/media/branding/miraj-mj-mark-jade.png" alt="" width={1052} height={1167} priority />
        </Link>

        <div className="col-start-3 flex items-center max-[700px]:hidden">
          <Link className={`${navItem} max-[700px]:hidden`} href={routes.realms}>Reinos</Link>
          <Link className={navItem} href={routes.download}>Download</Link>
        </div>
        <details className="group absolute right-3 top-2 z-30 hidden max-[700px]:block">
          <summary className="grid min-h-12 min-w-24 list-none place-items-center bg-[url('/media/game-ui/jade/button-default.png')] bg-[length:100%_100%] px-5 text-xs uppercase tracking-[.08em] focus:bg-[url('/media/game-ui/jade/button-focused.png')] focus:drop-shadow-[0_0_7px_rgba(40,185,111,.7)] focus-visible:bg-[url('/media/game-ui/jade/button-focused.png')]">Menu</summary>
          <div className="jade-card absolute right-0 top-12 grid w-[min(300px,calc(100vw-24px))] gap-1 p-2">
            <Link className={navItem} href={routes.home}>Início</Link>
            <Link className={navItem} href={routes.game}>O jogo</Link>
            <Link className={navItem} href={routes.realms}>Reinos</Link>
            <Link className={navItem} href={routes.download}>Download</Link>
            <Link className={navItem} href={routes.login}>Entrar</Link>
            <Link className={navItem} href={routes.register}>Criar conta</Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
