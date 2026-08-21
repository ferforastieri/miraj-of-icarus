"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { PrestigeBadge } from "@/components/game/PrestigeBadge";
import { MAX_CHARACTER_LEVEL, prestigeTierForLevel, prestigeTiers, type GameClassId } from "@/components/game/model";

type Props = { classId: GameClassId };

export function ClassCrestEvolution({ classId }: Props) {
  const classesT = useTranslations("Classes");
  const prestigeT = useTranslations("Prestige");
  const [level, setLevel] = useState(0);
  const levelRef = useRef(0);
  const tier = prestigeTierForLevel(level);
  const nextTier = prestigeTiers.find(item => item.level > level);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setLevel(80));
      return () => cancelAnimationFrame(frame);
    }

    const timer = window.setInterval(() => {
      levelRef.current = levelRef.current >= MAX_CHARACTER_LEVEL ? 0 : levelRef.current + 1;
      setLevel(levelRef.current);
    }, 125);
    return () => window.clearInterval(timer);
  }, []);

  const chooseLevel = (value: number) => {
    levelRef.current = value;
    setLevel(value);
  };
  const meterStyle = { width: `${level / MAX_CHARACTER_LEVEL * 100}%` } as CSSProperties;

  return (
    <div className="mx-auto mt-10 grid w-[min(1060px,100%)] grid-cols-[minmax(320px,.9fr)_minmax(320px,1.1fr)] items-center gap-10 text-left max-[780px]:grid-cols-1 max-[780px]:text-center">
      <div className="relative grid min-h-[480px] place-items-center max-[520px]:min-h-[350px]">
        <span className="character-showcase__glow absolute size-[72%] rounded-full" aria-hidden="true" />
        <span className="character-showcase__ring absolute size-[72%] rotate-45 border border-[#d9c478]/55" aria-hidden="true" />
        <span className="character-showcase__ring character-showcase__ring--reverse absolute size-[88%] rounded-full border border-[#8bcba7]/35" aria-hidden="true" />
        <div className="prestige-ritual__reveal relative z-10 grid w-[min(460px,86vw)] place-items-center" key={tier.id}>
          <span className="prestige-ritual__beam absolute inset-y-[8%] left-1/2 w-[18%] -translate-x-1/2" aria-hidden="true" />
          <PrestigeBadge classId={classId} className="w-full drop-shadow-[0_24px_28px_rgba(1,13,11,.65)]" level={level} selected interpolate={false} />
        </div>
      </div>

      <div className="max-[780px]:mx-auto max-[780px]:max-w-xl">
        <p className="text-xs uppercase tracking-[.18em]" style={{ color: tier.color }}>{prestigeT(`tiers.${tier.id}.stage`)}</p>
        <div className="mt-2 flex items-end gap-5 max-[780px]:justify-center">
          <strong className="font-miraj-of-icarus text-[clamp(4.8rem,10vw,8rem)] font-normal leading-[.78] text-white">{level}</strong>
          <div className="pb-1">
            <span className="block text-[.62rem] uppercase tracking-[.18em] text-[#9be2b5]">{classesT("level", { level })}</span>
            <h3 className="mt-1 font-miraj-of-icarus text-[clamp(2rem,4vw,3.5rem)] leading-none text-[#f4efdc]">{prestigeT(`tiers.${tier.id}.name`)}</h3>
          </div>
        </div>
        <p className="mt-6 text-base leading-7 text-[#d4dfd7]">{prestigeT(`tiers.${tier.id}.description`)}</p>
        <p className="mt-5 text-sm text-[#e5cd8a]">{nextTier ? classesT("nextCrest", { name: prestigeT(`tiers.${nextTier.id}.name`), level: nextTier.level }) : classesT("finalCrest")}</p>

        <label className="mt-8 grid gap-3 text-[.65rem] uppercase tracking-[.15em] text-[#edf3eb]">
          {classesT("chooseLevel")}
          <input
            className="w-full accent-[#78b79a]"
            type="range"
            min="0"
            max={MAX_CHARACTER_LEVEL}
            value={level}
            aria-label={classesT("chooseLevel")}
            onChange={event => chooseLevel(Number(event.target.value))}
          />
        </label>
        <div className="mt-3 h-1 overflow-hidden bg-[#071c18] ring-1 ring-[#a58a52]/60" aria-hidden="true">
          <span className="block h-full bg-[linear-gradient(90deg,#b77a43,#d9bc65_32%,#5ec48a_72%,#d9dfd3)] shadow-[0_0_10px_rgba(102,218,148,.75)] transition-[width] duration-300" style={meterStyle} />
        </div>
        <div className="mt-3 flex justify-between text-[.62rem] text-[#aacab7]" aria-hidden="true"><span>0</span><span>{MAX_CHARACTER_LEVEL}</span></div>
      </div>
    </div>
  );
}
