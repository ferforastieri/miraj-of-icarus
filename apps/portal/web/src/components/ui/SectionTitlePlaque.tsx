import Image from "next/image";
import { cn } from "@/lib/cn";

type SectionTitlePlaqueProps = {
  title: string;
  titleId?: string;
  description?: string;
  className?: string;
};

export function SectionTitlePlaque({ title, titleId, description, className }: SectionTitlePlaqueProps) {
  return (
    <header className={cn("mx-auto w-full max-w-[1220px] text-center", className)}>
      <div className="mx-auto flex w-full items-center justify-center overflow-hidden">
        <div className="min-w-0 flex-1">
          <Image className="h-auto w-full object-contain object-right" src="/media/game-ui/jade/section-title-side-v1.png" alt="" width={1200} height={214} sizes="(max-width: 700px) 20vw, 36vw" aria-hidden="true" />
        </div>

        <div className="relative z-10 -mx-1 w-[clamp(250px,34vw,430px)] shrink-0">
          <Image className="h-auto w-full" src="/media/game-ui/jade/section-title-center-v1.png" alt="" width={900} height={199} sizes="(max-width: 700px) 250px, 430px" aria-hidden="true" />
          <div className="absolute inset-x-[17%] inset-y-[20%] flex items-center justify-center [text-shadow:0_2px_4px_#010d0b,0_0_10px_#010d0b]">
            <h2 id={titleId} className="font-miraj-of-icarus text-[clamp(1rem,2.1vw,1.75rem)] font-semibold uppercase leading-none tracking-[.04em] text-[#f8f1d7]">{title}</h2>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <Image className="h-auto w-full -scale-x-100 object-contain object-right" src="/media/game-ui/jade/section-title-side-v1.png" alt="" width={1200} height={214} sizes="(max-width: 700px) 20vw, 36vw" aria-hidden="true" />
        </div>
      </div>
      {description && <p className="mx-auto mt-1 max-w-3xl px-5 font-medium leading-7 text-[#f4f1e5] [text-shadow:0_2px_4px_#021713,0_0_10px_#021713]">{description}</p>}
    </header>
  );
}
