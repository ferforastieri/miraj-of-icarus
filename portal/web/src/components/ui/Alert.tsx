import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Alert({
  kind = "error",
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { kind?: "error" | "success" }) {
  return (
    <p
      className={cn(
        "px-5 py-3 text-sm [clip-path:polygon(8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%,0_8px)]",
        kind === "error"
          ? "bg-danger/15 text-[#ffd5da] shadow-[inset_0_0_0_1px_#a85c65]"
          : "bg-frost/10 text-[#c9f8ff] shadow-[inset_0_0_0_1px_#52d4e7]",
        className,
      )}
      {...props}
    />
  );
}
