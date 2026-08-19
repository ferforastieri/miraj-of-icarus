import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MobileNavigation } from "@/components/MobileNavigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { cn } from "@/lib/cn";
import { routes } from "@/routes";

const navItem = "miraj-button relative z-10 grid min-h-[50px] w-[clamp(116px,10.5vw,154px)] min-w-0 shrink-0 place-items-center px-4 font-miraj-of-icarus text-[clamp(.54rem,.49rem+.13vw,.67rem)] font-semibold uppercase tracking-[.04em] text-[#e0e9df] [text-shadow:0_2px_2px_#041b16] hover:text-white hover:drop-shadow-[0_0_7px_rgba(40,185,111,.7)] focus-visible:text-white focus-visible:drop-shadow-[0_0_7px_rgba(40,185,111,.7)] max-[980px]:w-[116px] max-[980px]:px-3";
const accountItem = "miraj-button grid min-h-10 min-w-[142px] place-items-center px-8 text-[.6rem] tracking-[.035em] hover:text-white hover:drop-shadow-[0_0_7px_rgba(40,185,111,.7)] focus-visible:text-white focus-visible:drop-shadow-[0_0_7px_rgba(40,185,111,.7)]";
const dropdownMenuLink = "miraj-button grid min-h-[48px] w-[210px] place-items-center px-10 text-center font-miraj-of-icarus text-[.62rem] font-semibold uppercase tracking-[.07em] text-[#e8eadc] [text-shadow:0_2px_2px_#041b16] hover:text-white focus-visible:text-white";

type DropdownProps = {
  label: string;
  items: ReadonlyArray<{ href: string; label: string }>;
};

function NavDropdown({ label, items }: DropdownProps) {
  return (
    <div className="miraj-nav-dropdown relative w-[clamp(116px,10.5vw,154px)] min-w-0 shrink-0 max-[980px]:w-[116px]">
      <button className={`${navItem} w-full`} type="button" aria-haspopup="menu">
        <span className="flex items-center justify-center gap-1 leading-none">
          <span>{label}</span>
          <span className="text-[.58rem] text-[#cdb573]" aria-hidden="true">◆</span>
        </span>
      </button>
      <div className="miraj-nav-menu absolute left-1/2 top-[48px] z-40 w-[220px] justify-items-center pt-5" role="menu">
        {items.map(item => <Link className={dropdownMenuLink} href={item.href} key={item.href} role="menuitem">{item.label}</Link>)}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const t = useTranslations("Navigation");
  const gameItems = [
    { href: routes.gameAbout, label: t("about") },
    { href: routes.classes, label: t("characters") },
    { href: routes.skills, label: t("skills") },
  ];
  const shopItems = [
    { href: routes.trade, label: t("trade") },
    { href: routes.shop, label: t("shop") },
  ];

  return (
    <header className={cn("absolute inset-x-0 top-0 z-30 w-full pt-6 max-[900px]:pt-3")}>
      <div className="mb-1 flex justify-end gap-1 pr-5 font-miraj-of-icarus text-[.64rem] font-semibold uppercase tracking-[.08em] text-[#eee7d6] [text-shadow:0_1px_5px_#061d18] max-[900px]:hidden">
        <LocaleSwitcher />
        <Link className={accountItem} href={routes.login}>{t("login")}</Link>
        <Link className={accountItem} href={routes.register}>{t("register")}</Link>
      </div>

      <nav className="relative grid h-[82px] grid-cols-[minmax(0,1fr)_190px_minmax(0,1fr)] items-center max-[1050px]:grid-cols-[minmax(0,1fr)_170px_minmax(0,1fr)] max-[900px]:h-[68px] max-[900px]:grid-cols-[1fr_92px_1fr]" aria-label={t("mainAria")}>
        <div className="col-start-1 flex min-w-0 items-center justify-end max-[900px]:hidden">
          <Link className={navItem} href={routes.home}>{t("home")}</Link>
          <NavDropdown label={t("game")} items={gameItems} />
          <Link className={navItem} href={routes.realms}>{t("realms")}</Link>
        </div>

        <Link className="absolute -top-[72px] left-1/2 z-30 grid h-[214px] w-[180px] -translate-x-1/2 place-items-center max-[1050px]:-top-[58px] max-[1050px]:h-[190px] max-[1050px]:w-[160px] max-[900px]:hidden" href={routes.home} aria-label={t("homeAria")}>
          <Image className="absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_10px_14px_rgba(2,24,20,.62)]" src="/media/branding/miraj-header-medallion.png" alt="" width={983} height={1204} priority />
          <Image className="relative z-10 h-[82%] w-[82%] object-contain drop-shadow-[0_8px_7px_rgba(2,24,20,.78)]" src="/media/branding/miraj-mj-mark-jade.png" alt="" width={1052} height={1167} priority />
        </Link>

        <div className="col-start-3 flex min-w-0 items-center max-[900px]:hidden">
          <Link className={navItem} href={routes.download}>{t("download")}</Link>
          <Link className={navItem} href={routes.community}>{t("community")}</Link>
          <NavDropdown label={t("shop")} items={shopItems} />
        </div>

        <MobileNavigation />
      </nav>
    </header>
  );
}
