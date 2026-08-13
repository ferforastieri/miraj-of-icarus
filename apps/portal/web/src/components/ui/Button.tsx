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
    "miraj-button inline-flex min-h-[54px] min-w-[min(220px,100%)] cursor-pointer items-center justify-center gap-4 border-0 px-[clamp(1.25rem,3vw,2.25rem)] font-miraj-of-icarus font-semibold uppercase tracking-[.045em] [text-shadow:0_2px_2px_#041b16,0_0_5px_#041b16] transition-[filter,transform] duration-100 hover:text-white hover:drop-shadow-[0_0_9px_rgba(40,185,111,.7)] focus-visible:text-white focus-visible:drop-shadow-[0_0_9px_rgba(40,185,111,.7)] active:translate-y-px disabled:cursor-not-allowed disabled:text-[#89958e] disabled:drop-shadow-none",
    large && "min-h-[62px] min-w-[min(252px,100%)] px-[clamp(1.5rem,3.5vw,2.5rem)]",
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
