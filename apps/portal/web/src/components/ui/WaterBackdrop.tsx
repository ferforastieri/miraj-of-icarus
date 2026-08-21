import { cn } from "@/lib/cn";

type WaterBackdropProps = {
  className?: string;
  imagePosition?: string;
  subtle?: boolean;
  fixed?: boolean;
};

/** Shared cinematic background used by every portal route. */
export function WaterBackdrop({ className, imagePosition = "bg-center", subtle = false, fixed = false }: WaterBackdropProps) {
  return (
    <div className={cn("pointer-events-none inset-0 -z-30 overflow-hidden", fixed ? "fixed" : "absolute", className)} aria-hidden="true">
      <div className={cn("absolute inset-0 bg-[url('/media/portal-hero-v3.png')] bg-cover", imagePosition, subtle && "opacity-35")} />
      <div className={cn(
        "absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,249,219,.1),transparent_38%),linear-gradient(180deg,rgba(8,13,16,.12),rgba(10,14,16,.68)_72%,rgba(9,13,15,.9))]",
        subtle && "bg-[linear-gradient(180deg,rgba(10,14,16,.5),rgba(9,13,15,.82))]",
      )} />
      <div className="absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-[#d1b36f]/70 to-transparent" />
    </div>
  );
}
