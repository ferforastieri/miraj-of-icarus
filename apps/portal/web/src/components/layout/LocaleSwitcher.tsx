"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localeDetails, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LocaleSwitcher({ mobile = false }: { mobile?: boolean }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");

  return (
    <div className={cn("flex h-10 items-stretch border border-[#9f8750]/70 bg-[#031b17]/85", mobile && "h-12 w-full")} role="group" aria-label={t("label")}>
      {routing.locales.map(item => (
        <Link
          className={cn(
            "grid min-w-11 place-items-center border-r border-[#9f8750]/45 px-3 font-miraj-of-icarus text-[.61rem] font-semibold uppercase text-[#d9e5d9] transition-colors last:border-r-0 hover:bg-[#176344] hover:text-white focus-visible:bg-[#176344] focus-visible:text-white",
            mobile && "flex-1 text-[.68rem]",
            locale === item && "bg-[#258257] text-white",
          )}
          href={pathname as never}
          locale={item}
          key={item}
          title={t(item)}
          aria-current={locale === item ? "page" : undefined}
        >
          <span aria-hidden="true">{localeDetails[item].countryCode}</span>
          <span className="sr-only">{t(item)}</span>
        </Link>
      ))}
    </div>
  );
}
