"use client";

import { useLocale, useTranslations } from "next-intl";
import { BR, ES, US } from "country-flag-icons/react/3x2";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { localeDetails, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { gameClassIds, type GameClassId } from "@/components/game/model";

const localeFlags = { pt: BR, en: US, es: ES } as const;
const classSlugs: Record<Locale, Record<GameClassId, string>> = {
  pt: { warrior: "guerreiro", guardian: "guardiao", thief: "ladino", priest: "sacerdote", wizard: "mago", archer: "arqueiro", idoll: "idol", magician: "magician" },
  en: { warrior: "warrior", guardian: "guardian", thief: "thief", priest: "priest", wizard: "wizard", archer: "archer", idoll: "idol", magician: "magician" },
  es: { warrior: "guerrero", guardian: "guardian", thief: "picaro", priest: "sacerdote", wizard: "mago", archer: "arquero", idoll: "idolo", magician: "magician" },
};

export function LocaleSwitcher({ mobile = false }: { mobile?: boolean }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();
  const t = useTranslations("LocaleSwitcher");
  const CurrentFlag = localeFlags[locale];
  const hrefFor = (targetLocale: Locale) => {
    if (pathname !== "/classes/[slug]") return pathname;
    const classId = gameClassIds.find(id => classSlugs[locale][id] === params.slug);
    return {
      pathname: "/classes/[slug]" as const,
      params: { slug: classId ? classSlugs[targetLocale][classId] : params.slug ?? "" },
    };
  };

  if (mobile) {
    return (
      <div className="grid w-full grid-cols-3 gap-1" role="group" aria-label={t("label")}>
        {routing.locales.map(item => {
          const Flag = localeFlags[item];
          return (
            <Link
              className="miraj-button grid min-h-12 place-items-center px-3 font-miraj-of-icarus text-[.68rem] font-semibold uppercase text-[#e8eadc] [text-shadow:0_2px_2px_#041b16] hover:text-white focus-visible:text-white"
              href={hrefFor(item) as never}
              locale={item}
              key={item}
              title={t(item)}
            >
              <span className="flex items-center justify-center gap-2" aria-hidden="true">
                <Flag className="h-3.5 w-5 border border-[#e9d9a4]/55 object-cover shadow-[0_1px_3px_#021713]" />
                <span>{localeDetails[item].countryCode}</span>
              </span>
              <span className="sr-only">{t(item)}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="miraj-nav-dropdown relative z-50 w-[180px]" aria-label={t("label")}>
      <button
        className="miraj-button grid min-h-10 w-full place-items-center px-8 font-miraj-of-icarus text-[.6rem] font-semibold uppercase tracking-[.035em] text-[#e8eadc] [text-shadow:0_2px_2px_#041b16] hover:text-white focus-visible:text-white"
        type="button"
        aria-haspopup="menu"
        title={t(locale)}
      >
        <span className="relative flex w-full min-w-0 items-center justify-center leading-none">
          <CurrentFlag className="absolute left-0 h-3.5 w-5 border border-[#e9d9a4]/55 object-cover shadow-[0_1px_3px_#021713]" aria-hidden="true" />
          <span className="min-w-0 truncate text-center">{localeDetails[locale].countryCode}</span>
          <span className="absolute right-0 text-[.52rem] text-[#cdb573]" aria-hidden="true">◆</span>
        </span>
      </button>

      <div className="miraj-nav-menu absolute left-1/2 top-[38px] z-50 w-[230px] justify-items-center pt-5" role="menu">
        {routing.locales.map(item => {
          const Flag = localeFlags[item];
          return (
            <Link
              className={cn(
                "miraj-button flex min-h-[48px] w-[220px] items-center justify-center gap-3 px-8 text-center font-miraj-of-icarus text-[.57rem] font-semibold uppercase tracking-[.035em] text-[#e8eadc] [text-shadow:0_2px_2px_#041b16] hover:text-white focus-visible:text-white",
                locale === item && "text-white",
              )}
              href={hrefFor(item) as never}
              locale={item}
              key={item}
              role="menuitem"
              aria-current={locale === item ? "page" : undefined}
              title={t(item)}
            >
              <Flag className="h-3.5 w-5 shrink-0 border border-[#e9d9a4]/55 object-cover shadow-[0_1px_3px_#021713]" aria-hidden="true" />
              <span className="truncate">{localeDetails[item].label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
