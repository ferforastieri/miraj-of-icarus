import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routes } from "@/routes";

type SocialNetwork = "Discord" | "YouTube" | "Instagram" | "X";

function SocialIcon({ network }: { network: SocialNetwork }) {
  if (network === "YouTube") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" /></svg>;
  }

  if (network === "Instagram") {
    return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  }

  if (network === "X") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.3l7.3-8.4L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.4 4H6.6l11.2 15.8Z" /></svg>;
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M19.5 5.3A18 18 0 0 0 15.4 4l-.5 1a15 15 0 0 0-5.8 0l-.5-1a18 18 0 0 0-4.1 1.3C1.9 9.2 1.2 13 1.6 16.8A17 17 0 0 0 6.7 19l1.2-1.7c-.7-.3-1.4-.6-2-1l.5-.4a13.5 13.5 0 0 0 11.2 0l.5.4c-.6.4-1.3.7-2 1l1.2 1.7a17 17 0 0 0 5.1-2.2c.5-4.4-.8-8.2-2.9-11.5ZM8.7 14.7c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Zm6.6 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Z" /></svg>;
}

export function SiteFooter() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Navigation");
  const explore = [[nav("game"), routes.game], [nav("characters"), routes.classes], [nav("realms"), routes.realms], [nav("community"), routes.community], [nav("download"), routes.download]] as const;
  const footerLink = "text-[#c8d8cc] hover:text-[#8fe2b0] focus-visible:text-white";

  return (
    <footer className="relative isolate w-full overflow-hidden border-t border-[#9c824b] bg-[#031815] px-6 py-7 max-[700px]:px-4 max-[700px]:py-8">
      <div className="absolute inset-x-0 top-0 -z-10 h-28 bg-[radial-gradient(ellipse_at_50%_0%,rgba(40,185,111,.18),transparent_70%)]" aria-hidden="true" />
      <span className="absolute left-1/2 top-0 h-px w-[min(900px,88vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d1b36f] to-transparent" aria-hidden="true" />

      <div className="mx-auto flex w-[min(1220px,100%)] items-center justify-between gap-7 max-[900px]:flex-wrap max-[700px]:flex-col max-[700px]:text-center">
        <Link className="flex h-16 w-[220px] shrink-0 items-center max-[700px]:justify-center" href={routes.home} aria-label={nav("homeAria")}>
          <Image className="h-full w-full object-contain object-left max-[700px]:object-center" src="/media/branding/miraj-of-icarus-wordmark-jade.png" alt="Miraj of Icarus" width={1413} height={673} />
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[.72rem] uppercase tracking-[.08em]" aria-label={t("navigationAria")}>
          {explore.map(([label, href]) => <Link className={footerLink} href={href} key={label}>{label}</Link>)}
        </nav>

        <div className="flex shrink-0 items-center gap-2" aria-label={t("socialAria")}>
          {(["Discord", "YouTube", "Instagram", "X"] as const).map(network => (
            <span className="grid size-8 place-items-center text-[#bcd1c3] [&_svg]:size-5" key={network} title={t("comingSoon", { network })}>
              <span className="sr-only">{t("comingSoon", { network })}</span>
              <SocialIcon network={network} />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-5 flex w-[min(1220px,100%)] items-center justify-between gap-5 border-t border-[#315548]/80 pt-4 text-[.58rem] uppercase tracking-[.1em] text-[#718b7e] max-[700px]:flex-col max-[700px]:gap-2 max-[700px]:text-center">
        <p>© {new Date().getFullYear()} Miraj of Icarus</p>
        <p>{t("reconstruction")}</p>
        <div className="flex gap-4"><Link className={footerLink} href={routes.login}>{nav("login")}</Link><Link className={footerLink} href={routes.register}>{nav("register")}</Link></div>
      </div>
    </footer>
  );
}
