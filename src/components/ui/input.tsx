import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full border-0 border-b border-neutral-300 bg-transparent px-0 text-lg outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-0",
        className,
      )}
      {...props}
    />
  );
}
