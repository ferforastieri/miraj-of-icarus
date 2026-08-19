import Image from "next/image";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { MAX_CHARACTER_LEVEL, prestigeBlendForLevel, prestigeTierForLevel } from "@/data/game-classes";

type PrestigeBadgeProps = {
  classId: string;
  level: number;
  selected?: boolean;
  interpolate?: boolean;
  className?: string;
  priority?: boolean;
};

export function PrestigeBadge({ classId, level, selected = false, interpolate = true, className = "", priority = false }: PrestigeBadgeProps) {
  const prestigeT = useTranslations("Prestige");
  const classesT = useTranslations("Classes");
  const normalizedLevel = Math.max(0, Math.min(MAX_CHARACTER_LEVEL, Math.floor(level)));
  const blend = prestigeBlendForLevel(normalizedLevel);
  const tier = prestigeTierForLevel(normalizedLevel);
  const visibleTier = interpolate ? blend.from : tier;
  const suffix = selected ? "-selected" : "";
  const initialBrightness = normalizedLevel < 10 ? 0.55 + blend.progress * 0.45 : 1;
  const style = { "--prestige-color": tier.color } as CSSProperties;

  return (
    <div
      className={`prestige-badge relative aspect-square shrink-0 ${className}`}
      data-level={normalizedLevel}
      data-tier={tier.id}
      style={style}
      aria-label={`${prestigeT(`tiers.${tier.id}.name`)}, ${classesT("level", { level: normalizedLevel })}`}
    >
      <Image
        className="absolute inset-0 size-full object-contain transition-[filter] duration-300"
        style={{ filter: `brightness(${initialBrightness}) saturate(${0.45 + blend.progress * 0.55})` }}
        src={`/media/game-ui/classes/${visibleTier.id}/${classId}${suffix}.png`}
        alt=""
        width={256}
        height={256}
        priority={priority}
        unoptimized
      />
      {interpolate && blend.to.id !== blend.from.id && (
        <Image
          className="absolute inset-0 size-full object-contain transition-opacity duration-300"
          style={{ opacity: blend.progress }}
          src={`/media/game-ui/classes/${blend.to.id}/${classId}${suffix}.png`}
          alt=""
          width={256}
          height={256}
          unoptimized
        />
      )}
      <span className="prestige-badge__level absolute bottom-[8%] left-1/2 z-10 grid min-w-[2.25em] -translate-x-1/2 place-items-center px-[.42em] py-[.18em] text-[clamp(.62rem,14cqi,1rem)] font-semibold leading-none text-white [text-shadow:0_2px_3px_#020b09]">
        {normalizedLevel}
      </span>
    </div>
  );
}
