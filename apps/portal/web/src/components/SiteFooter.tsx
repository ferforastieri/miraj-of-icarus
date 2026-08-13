import Image from "next/image";
import Link from "next/link";
import { routes } from "@/routes";

export function SiteFooter() {
  const footerLink = "w-fit text-[#c8d8cc] transition-colors hover:text-[#8fe2b0] focus-visible:text-white";

  return (
    <footer className="relative isolate w-full overflow-hidden border-t border-[#9c824b] bg-[#031815] px-6 pb-8 pt-20 max-[700px]:px-4 max-[700px]:pb-6 max-[700px]:pt-14">
      <div className="absolute inset-x-0 top-0 -z-10 h-44 bg-[radial-gradient(ellipse_at_50%_0%,rgba(40,185,111,.2),transparent_67%)]" aria-hidden="true" />
      <span className="absolute left-1/2 top-0 h-px w-[min(900px,88vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d1b36f] to-transparent" aria-hidden="true" />

      <div className="mx-auto grid w-[min(1180px,100%)] grid-cols-[1.45fr_repeat(3,1fr)] gap-x-14 gap-y-12 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
        <div className="max-w-sm">
          <Link className="inline-block" href={routes.home} aria-label="Miraj of Icarus — início">
            <Image className="h-auto w-[min(330px,76vw)]" src="/media/branding/miraj-of-icarus-wordmark-jade.png" alt="Miraj of Icarus" width={1413} height={673} />
          </Link>
          <p className="mt-1 max-w-xs text-sm leading-7 text-[#9fb3a6]">Um mundo reconstruído para reunir antigos aventureiros e abrir novas rotas pelos céus.</p>
        </div>

        <nav className="grid content-start gap-3 text-sm" aria-label="Navegação do rodapé">
          <p className="mb-2 font-miraj-of-icarus text-xs uppercase tracking-[.18em] text-[#d1b36f]">Explore</p>
          <Link className={footerLink} href={routes.game}>O jogo</Link>
          <Link className={footerLink} href={routes.classes}>Classes</Link>
          <Link className={footerLink} href={routes.prestige}>Prestígio</Link>
          <Link className={footerLink} href={routes.realms}>Reinos</Link>
        </nav>

        <nav className="grid content-start gap-3 text-sm" aria-label="Conta e download">
          <p className="mb-2 font-miraj-of-icarus text-xs uppercase tracking-[.18em] text-[#d1b36f]">Sua passagem</p>
          <Link className={footerLink} href={routes.login}>Entrar</Link>
          <Link className={footerLink} href={routes.register}>Criar conta</Link>
          <Link className={footerLink} href={routes.client}>Área do cliente</Link>
          <Link className={footerLink} href={routes.download}>Baixar launcher</Link>
        </nav>

        <div className="content-start">
          <p className="mb-5 font-miraj-of-icarus text-xs uppercase tracking-[.18em] text-[#d1b36f]">Comunidade</p>
          <div className="flex flex-wrap gap-2" aria-label="Redes sociais — em breve">
            {["Discord", "YouTube", "Instagram", "X"].map(network => (
              <span className="grid min-h-10 min-w-10 place-items-center border border-[#47705f] bg-[#082c26] px-3 text-[.65rem] uppercase tracking-[.08em] text-[#b9cabe]" key={network} title={`${network} — em breve`}>{network}</span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#718b7e]">Canais oficiais em preparação.</p>
        </div>
      </div>

      <div className="mx-auto mt-16 flex w-[min(1180px,100%)] items-center justify-between gap-6 border-t border-[#315548] pt-7 text-[.68rem] uppercase tracking-[.12em] text-[#718b7e] max-[700px]:mt-12 max-[700px]:flex-col max-[700px]:items-start">
        <p>© {new Date().getFullYear()} Miraj of Icarus</p>
        <p>Uma reconstrução independente em andamento</p>
      </div>
    </footer>
  );
}
