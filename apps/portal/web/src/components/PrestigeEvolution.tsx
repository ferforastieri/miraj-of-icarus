"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { PrestigeBadge } from "@/components/PrestigeBadge";
import { Button, buttonStyles } from "@/components/ui/Button";
import { classHref, gameClasses, MAX_CHARACTER_LEVEL, prestigeTierForLevel, prestigeTiers, type GameClass } from "@/data/game-classes";

export function PrestigeEvolution() {
  const [classId, setClassId] = useState<GameClass["id"]>("warrior");
  const [level, setLevel] = useState(0);
  const [playing, setPlaying] = useState(true);
  const selectedClass = gameClasses.find(gameClass => gameClass.id === classId) ?? gameClasses[0];
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
    <div className="mx-auto mt-16 w-[min(1240px,100%)]" data-testid="prestige-evolution">
      <div className="border-y border-[#947a44] bg-[#092f29]/95 px-[clamp(1rem,2.4vw,2.5rem)] py-9 text-[#edf1e7] shadow-[0_26px_60px_rgba(1,18,15,.35)]">
        <div className="grid grid-cols-8 gap-2 max-[1050px]:grid-cols-4 max-[520px]:grid-cols-2" role="group" aria-label="Escolha uma classe">
          {gameClasses.map(gameClass => (
            <button
              className={`relative grid min-h-[116px] cursor-pointer place-items-center border bg-[#041f1b]/72 px-2 py-2 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0d68a] ${classId === gameClass.id ? "border-[#e2c36b] shadow-[inset_0_0_18px_rgba(205,167,70,.18),0_0_14px_rgba(205,167,70,.2)]" : "border-[#8c784a]/45"}`}
              key={gameClass.id}
              type="button"
              aria-pressed={classId === gameClass.id}
              aria-label={`Exibir a evolução de ${gameClass.name}`}
              onClick={() => setClassId(gameClass.id)}
            >
              <Image className="size-[72px] object-contain" src={`/media/game-ui/classes/gold/${gameClass.id}.png`} alt="" width={96} height={96} />
              <span className="font-miraj-of-icarus text-[.62rem] uppercase tracking-[.07em] text-[#f0dfaa]">{gameClass.name}</span>
              {classId === gameClass.id && <span className="absolute inset-x-3 bottom-0 h-px bg-[#f0d171] shadow-[0_0_7px_#d7ad43]" />}
            </button>
          ))}
        </div>

        <div className="mt-9 grid grid-cols-[minmax(310px,.9fr)_minmax(330px,1fr)] items-center gap-12 max-[720px]:grid-cols-1 max-[720px]:gap-7">
          <div className="prestige-ritual relative mx-auto grid w-[min(390px,82vw)] place-items-center" data-tier={tier.id}>
            <div className="prestige-ritual__gate absolute size-[76%] rotate-45 border border-[#ceb975]/35 bg-[#0b463a]/45 shadow-[inset_0_0_50px_rgba(255,255,255,.05)]" style={{ boxShadow: `inset 0 0 50px rgba(255,255,255,.05), 0 0 55px color-mix(in srgb, ${tier.color}, transparent 62%)` }} aria-hidden="true" />
            <div className="prestige-ritual__orbit absolute size-[86%] rounded-full border border-[#cfb765]/35" aria-hidden="true">
              <i /><i /><i /><i />
            </div>
            <div className="prestige-ritual__reveal relative z-10 grid w-full place-items-center" key={`${classId}-${tier.id}`}>
              <span className="prestige-ritual__beam absolute inset-y-[8%] left-1/2 w-[18%] -translate-x-1/2" aria-hidden="true" />
              <PrestigeBadge classId={classId} className="w-full drop-shadow-[0_24px_28px_rgba(1,13,11,.65)]" level={level} selected interpolate={false} priority />
            </div>
          </div>
          <div className="text-left max-[720px]:text-center">
          <p className="font-miraj-of-icarus text-[.65rem] uppercase tracking-[.18em] text-[#7ee2a7]">{selectedClass.role}</p>
          <h3 className="mt-2 font-miraj-of-icarus text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[.9] text-[#f4efdc]">{selectedClass.name}</h3>
          <p className="mt-3 text-sm leading-6 text-[#b9cbbf]">{selectedClass.epithet}</p>
          <div className="mt-5 flex items-end gap-5 max-[720px]:justify-center">
            <strong className="text-[clamp(4.5rem,10vw,8rem)] font-normal leading-none text-white">{level}</strong>
            <span className="mb-3 text-sm uppercase tracking-[.14em] text-[#9db6aa]">de {MAX_CHARACTER_LEVEL}</span>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[.18em]" style={{ color: tier.color }}>{tier.stage}</p>
          <h4 className="mt-1 text-[clamp(2rem,3.5vw,3.5rem)] leading-none text-[#f4efdc]">{tier.name}</h4>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#c5d5ca] max-[720px]:mx-auto">{tier.description}</p>
          <p className="mt-5 text-sm text-[#91a99e]">{nextTier ? `Próximo brasão: ${nextTier.name}, conquistado no nível ${nextTier.level}.` : "O brasão alcançou sua forma lendária definitiva."}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 max-[720px]:justify-center max-[520px]:flex-col">
            <Button disabled={level >= MAX_CHARACTER_LEVEL} onClick={() => setPlaying(current => !current)}>{level >= MAX_CHARACTER_LEVEL ? "Evolução concluída" : playing ? "Pausar evolução" : "Reproduzir evolução"}</Button>
            <label className="grid min-w-[240px] gap-2 text-[.65rem] uppercase tracking-[.12em] text-[#a8bcb1] max-[520px]:w-full">
              Escolher nível
              <input className="accent-[#78b79a]" type="range" min="0" max={MAX_CHARACTER_LEVEL} value={level} onChange={event => { setPlaying(false); setLevel(Number(event.target.value)); }} />
            </label>
            <Link className={buttonStyles("ghost")} href={classHref(selectedClass)}>Conhecer a classe</Link>
          </div>
          </div>
        </div>
      </div>

      <div className="prestige-meter mt-7 overflow-x-auto pb-3" style={meterStyle}>
        <div className="relative grid min-w-[930px] grid-cols-11 gap-2 before:absolute before:left-[4.5%] before:right-[4.5%] before:top-[15px] before:h-px before:bg-[linear-gradient(90deg,#a96743_var(--prestige-progress),#b9aa7d55_var(--prestige-progress))]">
          {prestigeTiers.map(item => (
            <button
              className="relative z-10 grid cursor-pointer justify-items-center gap-2 border-0 bg-transparent text-[#aebfb6] focus-visible:text-white"
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
