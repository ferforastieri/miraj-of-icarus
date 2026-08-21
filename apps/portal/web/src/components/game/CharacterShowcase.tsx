"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PrestigeBadge } from "@/components/game/PrestigeBadge";
import { MAX_CHARACTER_LEVEL, classHref, gameClassIds } from "@/components/game/model";
import { buttonStyles } from "@/components/ui/Button";
import { routes } from "@/i18n/routing";

export function CharacterShowcase() {
  const t = useTranslations("Classes");
  const metadata = useTranslations("Metadata");
  const [classIndex, setClassIndex] = useState(0);
  const [level, setLevel] = useState(0);
  const levelRef = useRef(0);
  const classId = gameClassIds[classIndex];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setLevel(80));
      return () => cancelAnimationFrame(frame);
    }

    const timer = window.setInterval(() => {
      levelRef.current += 1;
      if (levelRef.current > MAX_CHARACTER_LEVEL) {
        levelRef.current = 0;
        setClassIndex(index => (index + 1) % gameClassIds.length);
      }
      setLevel(levelRef.current);
    }, 95);
    return () => window.clearInterval(timer);
  }, []);

  const selectClass = (index: number) => {
    setClassIndex(index);
    levelRef.current = 0;
    setLevel(0);
  };

  return (
    <section className="mx-auto w-[min(1240px,100%)] px-6 pb-20 max-[700px]:px-4 max-[700px]:pb-14" aria-labelledby="character-showcase-title">
      <header className="mx-auto max-w-3xl pb-10 text-center">
        <p className="font-miraj-of-icarus text-xs uppercase tracking-[.24em] text-[#9be2b5]">{t("chooseAria")}</p>
        <h1 id="character-showcase-title" className="miraj-page-heading mt-4">{metadata("charactersPageTitle")}</h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#d4dfd7]">{metadata("charactersPageDescription")}</p>
      </header>

      <div className="grid grid-cols-[minmax(0,.82fr)_minmax(380px,1.18fr)] items-center gap-10 max-[900px]:grid-cols-1">
        <div className="max-[900px]:order-2 max-[900px]:text-center">
          <p className="text-xs uppercase tracking-[.2em] text-[#d6bd78]">{t(`items.${classId}.role`)}</p>
          <h2 className="mt-3 font-miraj-of-icarus text-[clamp(3rem,6vw,6rem)] leading-[.82] text-[#f5f0dc]">{t(`items.${classId}.name`)}</h2>
          <p className="mt-4 font-miraj-of-icarus text-xl text-[#e5cd8a]">{t(`items.${classId}.epithet`)}</p>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#c7d5cc] max-[900px]:mx-auto">{t(`items.${classId}.summary`)}</p>

          <dl className="mt-8 grid grid-cols-2 border-y border-[#a58a52]/70 text-left max-[520px]:grid-cols-1">
            {[[t("range"), t(`items.${classId}.range`)], [t("rhythm"), t(`items.${classId}.rhythm`)], [t("specialty"), t(`items.${classId}.specialty`)], [t("level", { level }), `${level}/${MAX_CHARACTER_LEVEL}`]].map(([term, value]) => (
              <div className="border-b border-r border-[#a58a52]/35 p-4" key={term}><dt className="text-[.62rem] uppercase tracking-[.16em] text-[#9be2b5]">{term}</dt><dd className="mt-1 text-lg text-[#f0ead8]">{value}</dd></div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3 max-[900px]:justify-center max-[520px]:flex-col">
            <Link className={buttonStyles("primary")} href={classHref(t(`slugs.${classId}`))}>{t("meet")}</Link>
            <Link className={buttonStyles("ghost")} href={routes.register}>{t("choose")}</Link>
          </div>
        </div>

        <div className="character-showcase__stage relative grid min-h-[560px] place-items-center max-[900px]:min-h-[460px] max-[520px]:min-h-[360px]">
          <span className="character-showcase__glow absolute size-[72%] rounded-full" aria-hidden="true" />
          <span className="character-showcase__ring absolute size-[76%] rotate-45 border border-[#d9c478]/55" aria-hidden="true" />
          <span className="character-showcase__ring character-showcase__ring--reverse absolute size-[90%] rounded-full border border-[#8bcba7]/35" aria-hidden="true" />
          <PrestigeBadge key={classId} classId={classId} className="character-showcase__crest relative z-10 w-[min(530px,88vw)]" level={level} selected priority />
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-2 sm:gap-4" role="group" aria-label={t("chooseAria")}>
        {gameClassIds.map((item, index) => (
          <button
            className={`relative grid size-[76px] place-items-center rounded-full transition-[transform,filter] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d68a] sm:size-[92px] ${item === classId ? "scale-110 drop-shadow-[0_0_18px_rgba(222,194,109,.7)]" : "opacity-70 grayscale-[.2] hover:scale-105 hover:opacity-100 hover:grayscale-0"}`}
            type="button"
            key={item}
            aria-label={t("showEvolution", { name: t(`items.${item}.name`) })}
            aria-pressed={item === classId}
            title={t(`items.${item}.name`)}
            onClick={() => selectClass(index)}
          >
            <Image
              className="size-full object-contain"
              src={`/media/game-ui/classes/gold/${item}${item === classId ? "-selected" : ""}.png`}
              alt=""
              width={112}
              height={112}
            />
            <span className={`absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-[#f0d171] shadow-[0_0_8px_#d7ad43] transition-[width,opacity] ${item === classId ? "w-10 opacity-100" : "w-0 opacity-0"}`} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
