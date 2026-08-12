import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("min-h-11 w-full border-0 bg-[linear-gradient(180deg,#203c4d,#102837)] px-4 text-moonsteel shadow-[inset_0_0_0_1px_#5c7581,inset_0_0_0_3px_#142b38] outline-0 [clip-path:polygon(8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%,0_8px)] focus:shadow-[inset_0_0_0_1px_#61d8ff,inset_0_0_0_3px_#123247,0_0_12px_rgba(82,212,231,.22)]", className)}
      {...props}
    />
  );
}
