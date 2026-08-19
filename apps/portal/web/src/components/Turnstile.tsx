"use client";

import Script from "next/script";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render(element: HTMLElement, options: Record<string, unknown>): string;
      remove(widgetId: string): void;
    };
  }
}

export function Turnstile({ onToken }: { onToken(token: string): void }) {
  const locale = useLocale();
  const t = useTranslations("Turnstile");
  const target = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function render() {
    if (!target.current || !window.turnstile || widget.current) return;
    widget.current = window.turnstile.render(target.current, {
      sitekey: siteKey,
      theme: "dark",
      language: locale === "pt" ? "pt-br" : locale,
      callback: onToken,
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
  }

  useEffect(() => () => {
    if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
  }, []);

  useEffect(() => {
    if (!siteKey && process.env.NODE_ENV !== "production") onToken("development-bypass");
  }, [onToken, siteKey]);

  if (!siteKey) return <div className="flex min-h-[65px] w-full items-center justify-center" aria-label={t("aria")}>
    {process.env.NODE_ENV === "production"
      ? <p role="alert" className="text-sm text-danger">{t("notConfigured")}</p>
      : <p className="text-xs uppercase tracking-[.08em] text-mist">{t("development")}</p>}
  </div>;

  return <div className="flex min-h-[65px] w-full justify-center overflow-hidden" aria-label={t("aria")}>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={render} />
    <div ref={target} className="min-h-[65px] max-w-full" />
  </div>;
}
