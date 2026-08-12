import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("min-h-11 w-full rounded-[2px] border border-[#506169] bg-iron px-3 text-moonsteel outline-0 focus:border-frost focus:shadow-[0_0_0_2px_rgba(82,212,231,.1)]", className)}
      {...props}
    />
  );
}
