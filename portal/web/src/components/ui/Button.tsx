import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "text-[#f2f6e9]",
  secondary: "text-[#e4ecdf]",
  ghost: "text-[#e4ecdf]",
  danger: "text-[#ffd9dc] saturate-[.65]",
};

export function buttonStyles(variant: Variant = "secondary", large = false) {
  return cn(
    "inline-flex min-h-[54px] min-w-[220px] cursor-pointer items-center justify-center gap-4 border-0 bg-[url('/media/game-ui/jade/button-default.png')] bg-[length:100%_100%] bg-center bg-no-repeat px-9 font-miraj-of-icarus text-[.92rem] font-semibold uppercase tracking-[.055em] [text-shadow:0_2px_2px_#041b16,0_0_5px_#041b16] transition-[filter,transform] duration-100 focus:bg-[url('/media/game-ui/jade/button-focused.png')] focus:text-white focus:drop-shadow-[0_0_9px_rgba(40,185,111,.7)] active:translate-y-px active:bg-[url('/media/game-ui/jade/button-pressed.png')] focus-visible:bg-[url('/media/game-ui/jade/button-focused.png')] disabled:cursor-not-allowed disabled:bg-[url('/media/game-ui/jade/button-disabled.png')] disabled:text-[#89958e] disabled:drop-shadow-none",
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
