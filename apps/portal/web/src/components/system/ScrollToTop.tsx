"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const frame = requestAnimationFrame(() => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ block: "start" });
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    return () => cancelAnimationFrame(frame);
  }, [locale, pathname]);

  return null;
}
