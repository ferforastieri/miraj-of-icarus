import Image from "next/image";
import Link from "next/link";

type Props = { compact?: boolean };

export function SiteHeader({ compact = false }: Props) {
  return (
    <header className={`gate-header${compact ? " gate-header-compact" : ""}`}>
      <nav className="gate-nav" aria-label="Navegação principal">
        <div className="gate-links gate-links-left">
          <Link href="/#jogo">O jogo</Link>
          <Link href="/#reconstrucao">Reconstrução</Link>
        </div>
        <Link className="gate-brand" href="/" aria-label="Masicarus — início">
          <Image src="/media/mark.png" alt="" width={126} height={126} priority />
          <span>MASICARUS</span>
        </Link>
        <div className="gate-links gate-links-right">
          <Link href="/#reinos">Reinos</Link>
          <Link href="/#download">Download</Link>
          <Link className="panel-link" href="/painel">Painel</Link>
        </div>
      </nav>
    </header>
  );
}
