import Image from "next/image";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata(
  "Sem conexão",
  "O portal de Miraj of Icarus está temporariamente sem conexão.",
);

export default function OfflinePage() {
  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#041d19] px-6 py-16 text-center">
      <div className="absolute inset-0 -z-30 bg-[url('/media/portal-hero-v3.png')] bg-cover bg-center opacity-25" aria-hidden="true" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(3,25,21,.72),rgba(3,25,21,.97))]" aria-hidden="true" />
      <section className="flex w-[min(720px,100%)] flex-col items-center">
        <Image
          className="mb-8 h-40 w-40 object-contain drop-shadow-[0_0_28px_rgba(40,185,111,.35)]"
          src="/media/branding/miraj-mj-mark-jade.png"
          alt=""
          width={1052}
          height={1167}
          priority
        />
        <p className="font-miraj-of-icarus text-xs uppercase tracking-[.22em] text-[#9be4b7]">A passagem foi interrompida</p>
        <h1 className="mt-5 font-miraj-of-icarus text-[clamp(3rem,8vw,6.5rem)] leading-[.86] text-[#f4efdc]">Os reinos estão fora de alcance.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-[#c4d4c9]">Verifique sua conexão e tente abrir o portal novamente.</p>
        <Link className={`${buttonStyles("primary", true)} mt-10`} href="/">Tentar novamente</Link>
      </section>
    </main>
  );
}
