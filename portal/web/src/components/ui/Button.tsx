import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "text-[#eafaff]",
  secondary: "text-[#dce9ed]",
  ghost: "text-[#dce9ed]",
  danger: "text-[#ffd9dc] saturate-[.65]",
};

export function buttonStyles(variant: Variant = "secondary", large = false) {
  return cn(
    "inline-flex min-h-[54px] min-w-[220px] cursor-pointer items-center justify-center gap-4 border-0 bg-[url('/media/game-ui/buttons/default.png')] bg-[length:100%_100%] bg-center bg-no-repeat px-9 font-miraj-of-icarus text-[.92rem] font-semibold uppercase tracking-[.055em] [text-shadow:0_2px_2px_#02070b,0_0_5px_#02070b] transition-[filter,transform] duration-100 hover:bg-[url('/media/game-ui/buttons/focused.png')] hover:text-white hover:drop-shadow-[0_0_9px_rgba(30,139,255,.75)] active:translate-y-px active:bg-[url('/media/game-ui/buttons/pressed.png')] focus-visible:bg-[url('/media/game-ui/buttons/focused.png')] disabled:cursor-not-allowed disabled:bg-[url('/media/game-ui/buttons/disabled.png')] disabled:text-[#89959a] disabled:drop-shadow-none",
    large && "min-h-[62px] min-w-[252px] px-10",
    variants[variant],
  );
}

export function Button({
  className,
  variant = "secondary",
  large = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; large?: boolean }) {
  return <button className={cn(buttonStyles(variant, large), className)} {...props} />;
}
