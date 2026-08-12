import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "border-[#9deef7] bg-gradient-to-b from-[#70dcea] to-[#36aebf] text-[#061014] shadow-[0_10px_35px_rgba(42,178,197,.22),inset_0_1px_#d7fbff] hover:from-[#93e7f1] hover:to-[#49bfd0]",
  secondary: "border-ancient-gold/50 bg-iron/90 text-moonsteel",
  ghost: "border-moonsteel/35 bg-abyss/55 text-moonsteel backdrop-blur-lg",
  danger: "border-danger/50 bg-transparent text-[#efb0b5]",
};

export function buttonStyles(variant: Variant = "secondary", large = false) {
  return cn(
    "inline-flex min-h-12 cursor-pointer items-center justify-center gap-4 rounded-[2px] border px-6 text-xs font-semibold uppercase tracking-[.12em] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
    large && "min-h-14 px-8",
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
