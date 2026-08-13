import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("min-h-11 w-full border-0 bg-[linear-gradient(180deg,#17463f,#0a302d)] px-4 text-moonsteel shadow-[inset_0_0_0_1px_#607c6b,inset_0_0_0_3px_#0b2926] outline-0 [clip-path:polygon(8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%,0_8px)] focus:shadow-[inset_0_0_0_1px_#91e5b4,inset_0_0_0_3px_#0f493c,0_0_12px_rgba(40,185,111,.28)]", className)}
      {...props}
    />
  );
}
