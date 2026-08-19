"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { PrestigeBadge } from "@/components/PrestigeBadge";
import { buttonStyles } from "@/components/ui/Button";
import { classHref, gameClasses, MAX_CHARACTER_LEVEL, prestigeTierForLevel, prestigeTiers, type GameClass } from "@/data/game-classes";

export function PrestigeEvolution() {
  const classesT = useTranslations("Classes");
  const prestigeT = useTranslations("Prestige");
  const [classId, setClassId] = useState<GameClass["id"]>("warrior");
  const [level, setLevel] = useState(0);
  const [playing, setPlaying] = useState(true);
  const selectedClass = gameClasses.find(gameClass => gameClass.id === classId) ?? gameClasses[0];
  const tier = prestigeTierForLevel(level);
  const nextTier = prestigeTiers.find(item => item.level > level);
  const className = (id: GameClass["id"]) => classesT(`items.${id}.name`);
  const tierName = (id: string) => id === "beginning" ? classesT("beginning") : prestigeT(`tiers.${id}.name`);
  const prestigeSteps = [{ id: "beginning", level: 0 }, ...prestigeTiers];

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      const reducedTimer = window.setTimeout(() => {
        setLevel(MAX_CHARACTER_LEVEL);
        setPlaying(false);
      }, 0);
      return () => window.clearTimeout(reducedTimer);
    }
    if (!playing) return;

    let timer: number | undefined;
    const start = () => {
      timer = window.setInterval(() => {
        setLevel(current => {
          if (current >= MAX_CHARACTER_LEVEL - 1) {
            if (timer !== undefined) window.clearInterval(timer);
            timer = undefined;
            window.setTimeout(() => setPlaying(false), 0);
            return MAX_CHARACTER_LEVEL;
          }
          return current + 1;
        });
      }, 145);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      window.removeEventListener("load", start);
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [playing]);

  const meterStyle = { "--prestige-progress": `${level / MAX_CHARACTER_LEVEL * 100}%` } as CSSProperties;

  return (
    <div className="mx-auto mt-0 w-[min(1240px,100%)]" data-testid="prestige-evolution">
      <div className="border-b border-[#d4b867] bg-transparent px-[clamp(1rem,2.4vw,2.5rem)] pb-9 pt-2 text-[#f7f4e8] [text-shadow:0_2px_4px_#010e0c,0_0_10px_#021713]">
        <div className="grid grid-cols-8 gap-2 max-[1050px]:grid-cols-4 max-[520px]:grid-cols-2" role="group" aria-label={classesT("chooseAria")}>
          {gameClasses.map(gameClass => (
            <button
              className={`relative grid min-h-[138px] cursor-pointer place-items-center border bg-transparent px-2 py-2 text-center drop-shadow-[0_3px_5px_rgba(1,16,13,.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0d68a] ${classId === gameClass.id ? "border-[#f2d477] shadow-[0_0_16px_rgba(205,167,70,.6)]" : "border-[#d9c37e]/85"}`}
              key={gameClass.id}
              type="button"
              aria-pressed={classId === gameClass.id}
              aria-label={classesT("showEvolution", { name: className(gameClass.id) })}
              onClick={() => setClassId(gameClass.id)}
            >
              <Image className="size-[94px] object-contain drop-shadow-[0_2px_5px_#031713]" src={`/media/game-ui/classes/gold/${gameClass.id}.png`} alt="" width={112} height={112} />
              <span className="font-miraj-of-icarus text-[.62rem] font-semibold uppercase tracking-[.07em] text-[#fff0b7]">{className(gameClass.id)}</span>
              {classId === gameClass.id && <span className="absolute inset-x-3 bottom-0 h-px bg-[#f0d171] shadow-[0_0_7px_#d7ad43]" />}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-[minmax(0,460px)_minmax(0,460px)] items-center justify-center gap-12 max-[900px]:grid-cols-1 max-[900px]:gap-7">
          <div className="grid justify-items-center">
            <div className="prestige-ritual relative mx-auto grid w-[min(460px,88vw)] place-items-center" data-tier={tier.id}>
              <div className="prestige-ritual__gate absolute size-[76%] rotate-45 border border-[#ceb975]/55 bg-transparent" style={{ boxShadow: `0 0 55px color-mix(in srgb, ${tier.color}, transparent 62%)` }} aria-hidden="true" />
              <div className="prestige-ritual__orbit absolute size-[86%] rounded-full border border-[#cfb765]/35" aria-hidden="true">
                <i /><i /><i /><i />
              </div>
              <div className="prestige-ritual__reveal relative z-10 grid w-full place-items-center" key={`${classId}-${tier.id}`}>
                <span className="prestige-ritual__beam absolute inset-y-[8%] left-1/2 w-[18%] -translate-x-1/2" aria-hidden="true" />
                <PrestigeBadge classId={classId} className="w-full drop-shadow-[0_24px_28px_rgba(1,13,11,.65)]" level={level} selected interpolate={false} priority />
              </div>
            </div>
            <Link className={`${buttonStyles("ghost")} -mt-2`} href={classHref(selectedClass)}>{classesT("meet")}</Link>
          </div>
          <div className="w-full text-left max-[900px]:mx-auto max-[900px]:max-w-[460px] max-[900px]:text-center">
          <p className="font-miraj-of-icarus text-[.65rem] font-semibold uppercase tracking-[.18em] text-[#a8f2c4]">{classesT(`items.${selectedClass.id}.role`)}</p>
          <h3 className="mt-2 font-miraj-of-icarus text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[.9] text-[#f4efdc]">{className(selectedClass.id)}</h3>
          <p className="mt-3 text-sm font-medium leading-6 text-[#eef2e9]">{classesT(`items.${selectedClass.id}.epithet`)}</p>
          <div className="mt-5 max-[900px]:text-center">
            <strong className="text-[clamp(4.5rem,10vw,8rem)] font-normal leading-none text-white">{level}</strong>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[.18em]" style={{ color: tier.color }}>{prestigeT(`tiers.${tier.id}.stage`)}</p>
          <h4 className="mt-1 text-[clamp(2rem,3.5vw,3.5rem)] leading-none text-[#f4efdc]">{tierName(tier.id)}</h4>
          <p className="mt-4 max-w-[460px] text-sm font-medium leading-6 text-[#f0f3ea] max-[900px]:mx-auto">{prestigeT(`tiers.${tier.id}.description`)}</p>
          <p className="mt-5 text-sm text-[#d7e5dc]">{nextTier ? classesT("nextCrest", { name: tierName(nextTier.id), level: nextTier.level }) : classesT("finalCrest")}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 max-[720px]:justify-center max-[520px]:flex-col">
            <label className="grid min-w-[240px] gap-2 text-[.65rem] font-semibold uppercase tracking-[.12em] text-[#edf3eb] max-[520px]:w-full">
              {classesT("chooseLevel")}
              <input className="accent-[#78b79a]" type="range" min="0" max={MAX_CHARACTER_LEVEL} value={level} onChange={event => { setPlaying(false); setLevel(Number(event.target.value)); }} />
            </label>
          </div>
          </div>
        </div>
      </div>

      <div className="prestige-meter mt-7 overflow-x-auto pb-3" style={meterStyle}>
        <div className="relative grid min-w-[1180px] grid-cols-12 gap-2">
          <span className="absolute left-[4.15%] right-[4.15%] top-[29px] h-[7px] overflow-hidden border-y border-[#dbc67f]/80 bg-[#071c18] shadow-[0_0_0_1px_#352d1c,0_0_12px_rgba(3,22,18,.85)]" aria-hidden="true">
            <span className="block h-full bg-[linear-gradient(90deg,#b77a43,#d9bc65_28%,#5ec48a_72%,#d9dfd3)] shadow-[0_0_10px_rgba(102,218,148,.75)] transition-[width] duration-300" style={{ width: "var(--prestige-progress)" }} />
          </span>
          {prestigeSteps.map(item => (
            <button
              className="relative z-10 grid cursor-pointer justify-items-center gap-2 border-0 bg-transparent font-medium text-[#eef2e9] [text-shadow:0_2px_4px_#010e0c,0_0_8px_#021713] focus-visible:text-white"
              key={item.id}
              type="button"
              onClick={() => { setPlaying(false); setLevel(item.level); }}
              aria-label={classesT("showTier", { name: tierName(item.id), level: item.level })}
            >
              <PrestigeBadge classId={classId} className={`w-16 transition-[filter,opacity] ${level >= item.level ? "opacity-100" : "opacity-65 grayscale-[.45]"}`} level={item.level} selected interpolate={false} />
              <strong className="text-xs font-normal">{tierName(item.id)}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
