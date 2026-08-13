import Image from "next/image";
import Link from "next/link";
import { routes } from "@/routes";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-[#827147] bg-[#041a16] px-6">
      <div className="mx-auto flex min-h-28 w-[min(1120px,100%)] items-center justify-between font-miraj-of-icarus text-xs uppercase tracking-[.1em] text-[#aebdad] max-[700px]:flex-col max-[700px]:justify-center max-[700px]:gap-3">
        <Link href={routes.home} aria-label="Miraj of Icarus — início">
          <Image className="h-auto w-52" src="/media/branding/miraj-of-icarus-wordmark-jade.png" alt="Miraj of Icarus" width={1413} height={673} />
        </Link>
        <p>Uma reconstrução independente em andamento</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
