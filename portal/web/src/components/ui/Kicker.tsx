import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Kicker({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mb-3.5 text-xs font-semibold uppercase tracking-[.24em] text-ancient-gold", className)} {...props} />;
}
