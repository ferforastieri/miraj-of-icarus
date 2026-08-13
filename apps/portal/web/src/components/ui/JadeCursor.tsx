"use client";

import { useEffect, useRef } from "react";

const interactiveSelector =
  "a, button:not(:disabled), label, select, summary, [role='button']:not([aria-disabled='true'])";
const textSelector = "input, textarea, [contenteditable='true']";

export function JadeCursor() {
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.documentElement.dataset.jadeCursor = "active";

    const moveCursor = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const overText = Boolean(target?.closest(textSelector));
      const interactive = !overText && Boolean(target?.closest(interactiveSelector));

      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
      cursor.dataset.visible = overText ? "false" : "true";
      cursor.dataset.interactive = interactive ? "true" : "false";
    };

    const hideCursor = () => {
      cursor.dataset.visible = "false";
    };

    window.addEventListener("pointermove", moveCursor, { passive: true });
    document.documentElement.addEventListener("mouseleave", hideCursor);

    return () => {
      delete document.documentElement.dataset.jadeCursor;
      window.removeEventListener("pointermove", moveCursor);
      document.documentElement.removeEventListener("mouseleave", hideCursor);
    };
  }, []);

  return (
    <span
      ref={cursorRef}
      className="jade-cursor"
      data-interactive="false"
      data-visible="false"
      aria-hidden="true"
    >
      <span className="jade-cursor__crystal" />
    </span>
  );
}
