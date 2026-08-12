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
        "border-l-2 px-3.5 py-3 text-sm",
        kind === "error"
          ? "border-danger bg-danger/10 text-[#efb0b5]"
          : "border-frost bg-frost/10 text-[#a9edf5]",
        className,
      )}
      {...props}
    />
  );
}
