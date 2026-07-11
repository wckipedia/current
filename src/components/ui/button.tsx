import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-[background-color,color,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        quiet: "bg-transparent text-neutral-600 hover:-translate-y-px hover:bg-neutral-100 hover:text-neutral-950 active:translate-y-0",
        selected: "bg-neutral-950 text-white hover:bg-neutral-800",
        link: "min-h-0 rounded-none px-0 py-0 text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950",
      },
      size: { default: "h-9", compact: "h-8 px-2.5 text-xs" },
    },
    defaultVariants: { variant: "quiet", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
