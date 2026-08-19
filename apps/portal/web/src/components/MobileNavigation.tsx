"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { routes } from "@/routes";

export function MobileNavigation() {
  const t = useTranslations("Navigation");
  const navigationItems = [
    { href: routes.home, label: t("home") },
    { href: routes.gameAbout, label: t("aboutGame") },
    { href: routes.classes, label: t("characters") },
    { href: routes.skills, label: t("skills") },
    { href: routes.realms, label: t("realms") },
    { href: routes.download, label: t("download") },
    { href: routes.community, label: t("community") },
    { href: routes.trade, label: t("trade") },
    { href: routes.shop, label: t("shop") },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dragStartYRef = useRef(0);
  const dragStartedAtRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    dragStartedAtRef.current = performance.now();
    dragOffsetRef.current = 0;
    isDraggingRef.current = true;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const nextOffset = Math.max(0, event.clientY - dragStartYRef.current);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>, canClose = true) => {
    if (!isDraggingRef.current) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const distance = dragOffsetRef.current;
    const elapsed = Math.max(1, performance.now() - dragStartedAtRef.current);
    const velocity = distance / elapsed;
    const shouldClose = canClose && (distance >= 88 || (distance >= 28 && velocity >= .65));

    isDraggingRef.current = false;
    setIsDragging(false);

    if (shouldClose) {
      setDragOffset(Math.max(window.innerHeight, 700));
      closeTimerRef.current = window.setTimeout(() => {
        setIsOpen(false);
        setDragOffset(0);
      }, 180);
      return;
    }

    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[60] hidden justify-end px-5 max-[900px]:flex">
      <button
        className="miraj-mobile-nav__trigger pointer-events-auto"
        type="button"
        aria-label={t("open")}
        aria-controls="mobile-navigation-sheet"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="pointer-events-auto fixed inset-0 z-[70]">
          <button className="miraj-mobile-sheet__backdrop" type="button" aria-label={t("close")} onClick={close} />
          <section
            className="miraj-mobile-sheet"
            id="mobile-navigation-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            data-dragging={isDragging}
            style={dragOffset > 0 ? { transform: `translateY(${dragOffset}px)` } : undefined}
          >
            <div
              className="miraj-mobile-sheet__drag-handle"
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={event => finishDrag(event)}
              onPointerCancel={event => finishDrag(event, false)}
              aria-hidden="true"
            >
              <span />
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 px-5 pb-3 pt-1">
              <div>
                <p className="text-[.56rem] uppercase tracking-[.2em] text-[#88d2a8]">{t("chooseDestination")}</p>
                <h2 className="mt-1 font-miraj-of-icarus text-xl text-[#f4edd6]" id="mobile-navigation-title">{t("navigation")}</h2>
              </div>
              <button ref={closeButtonRef} className="miraj-button miraj-mobile-sheet__close" type="button" onClick={close}>{t("closeButton")}</button>
            </div>

            <nav className="min-h-0 overflow-y-auto px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]" aria-label={t("mobileAria")}>
              <div className="grid grid-cols-2 gap-1">
                {navigationItems.map((item, index) => (
                  <Link className={`miraj-button miraj-mobile-sheet__link ${index === 0 ? "col-span-2 w-[min(260px,100%)] justify-self-center" : ""}`} href={item.href} key={item.href} onClick={close}>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="my-3 h-px bg-[linear-gradient(90deg,transparent,#c9b271,transparent)]" aria-hidden="true" />

              <LocaleSwitcher mobile />

              <div className="my-3 h-px bg-[linear-gradient(90deg,transparent,#c9b271,transparent)]" aria-hidden="true" />

              <div className="grid grid-cols-2 gap-1">
                <Link className="miraj-button miraj-mobile-sheet__account" href={routes.login} onClick={close}>{t("login")}</Link>
                <Link className="miraj-button miraj-mobile-sheet__account miraj-mobile-sheet__account--primary" href={routes.register} onClick={close}>{t("register")}</Link>
              </div>
            </nav>
          </section>
        </div>
      )}
    </div>
  );
}
