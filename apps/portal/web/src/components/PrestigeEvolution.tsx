"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { PrestigeBadge } from "@/components/PrestigeBadge";
import { Button } from "@/components/ui/Button";
import { MAX_CHARACTER_LEVEL, prestigeTierForLevel, prestigeTiers } from "@/data/game-classes";

export function PrestigeEvolution() {
  const [level, setLevel] = useState(0);
  const [playing, setPlaying] = useState(true);
  const tier = prestigeTierForLevel(level);
  const nextTier = prestigeTiers.find(item => item.level > level);

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
        setLevel(current => current >= MAX_CHARACTER_LEVEL ? 0 : current + 1);
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
    <div className="mx-auto mt-16 w-[min(1180px,100%)]" data-testid="prestige-evolution">
      <div className="grid grid-cols-[.88fr_1.12fr] items-center gap-14 border-y border-[#947a44] bg-[#092f29] px-[clamp(1.25rem,4vw,4rem)] py-10 text-[#edf1e7] shadow-[0_24px_50px_rgba(31,61,49,.18)] max-[800px]:grid-cols-1 max-[800px]:gap-5">
        <div className="prestige-ritual relative mx-auto grid w-[min(430px,88vw)] place-items-center" data-tier={tier.id}>
          <div className="prestige-ritual__gate absolute size-[76%] rotate-45 border border-[#ceb975]/35 bg-[#0b463a]/45 shadow-[inset_0_0_50px_rgba(255,255,255,.05)]" style={{ boxShadow: `inset 0 0 50px rgba(255,255,255,.05), 0 0 55px color-mix(in srgb, ${tier.color}, transparent 62%)` }} aria-hidden="true" />
          <div className="prestige-ritual__orbit absolute size-[86%] rounded-full border border-[#cfb765]/35" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <div className="prestige-ritual__reveal relative z-10 grid w-full place-items-center" key={tier.id}>
            <span className="prestige-ritual__beam absolute inset-y-[8%] left-1/2 w-[18%] -translate-x-1/2" aria-hidden="true" />
            <PrestigeBadge classId="warrior" className="w-full drop-shadow-[0_24px_28px_rgba(1,13,11,.65)]" level={level} selected interpolate={false} priority />
          </div>
        </div>
        <div className="text-left max-[800px]:text-center">
          <p className="text-xs uppercase tracking-[.2em] text-[#cdb778]">Nível atual</p>
          <div className="mt-2 flex items-end gap-5 max-[800px]:justify-center">
            <strong className="text-[clamp(4.5rem,10vw,8rem)] font-normal leading-none text-white">{level}</strong>
            <span className="mb-3 text-sm uppercase tracking-[.14em] text-[#9db6aa]">de {MAX_CHARACTER_LEVEL}</span>
          </div>
          <p className="mt-5 text-xs uppercase tracking-[.18em]" style={{ color: tier.color }}>{tier.stage}</p>
          <h3 className="mt-2 text-[clamp(2.6rem,5vw,4.8rem)] leading-[.86] text-[#f4efdc]">{tier.name}</h3>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#c5d5ca] max-[800px]:mx-auto">{tier.description}</p>
          <p className="mt-5 text-sm text-[#91a99e]">{nextTier ? `A cor já começa a avançar para ${nextTier.name}, conquistada no nível ${nextTier.level}.` : "O brasão alcançou sua forma lendária definitiva."}</p>
          <div className="mt-8 flex items-center gap-4 max-[800px]:justify-center max-[520px]:flex-col">
            <Button onClick={() => {
              if (!playing && level >= MAX_CHARACTER_LEVEL) setLevel(0);
              setPlaying(current => !current);
            }}>{playing ? "Pausar evolução" : "Reproduzir evolução"}</Button>
            <label className="grid min-w-[240px] gap-2 text-[.65rem] uppercase tracking-[.12em] text-[#a8bcb1] max-[520px]:w-full">
              Escolher nível
              <input className="accent-[#78b79a]" type="range" min="0" max={MAX_CHARACTER_LEVEL} value={level} onChange={event => { setPlaying(false); setLevel(Number(event.target.value)); }} />
            </label>
          </div>
        </div>
      </div>

      <div className="prestige-meter mt-7 overflow-x-auto pb-3" style={meterStyle}>
        <div className="relative grid min-w-[930px] grid-cols-11 gap-2 before:absolute before:left-[4.5%] before:right-[4.5%] before:top-[15px] before:h-px before:bg-[linear-gradient(90deg,#a96743_var(--prestige-progress),#b9aa7d55_var(--prestige-progress))]">
          {prestigeTiers.map(item => (
            <button
              className="relative z-10 grid cursor-pointer justify-items-center gap-2 border-0 bg-transparent text-[#566d63] focus-visible:text-[#173b32]"
              key={item.id}
              type="button"
              onClick={() => { setPlaying(false); setLevel(item.level); }}
              aria-label={`Exibir ${item.name}, nível ${item.level}`}
            >
              <span className="size-8 rotate-45 border border-[#9d8755] bg-[#f4efde] shadow-[inset_0_0_0_5px_#e5dfca]" style={level >= item.level ? { background: item.color, boxShadow: `inset 0 0 0 5px #f4efde, 0 0 12px ${item.color}` } : undefined} />
              <span className="text-[.62rem] uppercase tracking-[.08em]">{item.level}</span>
              <strong className="text-xs font-normal">{item.name}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
