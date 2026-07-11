"use client";

import { m, useInView, useReducedMotion } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

// Adapted from React Bits BlurText (TypeScript + Tailwind variant).
export function BlurText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const reduceMotion = useReducedMotion();
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const play = hydrated && inView && !reduceMotion;

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap", className)} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <m.span
          aria-hidden="true"
          className="mr-[0.22em] inline-block"
          initial={false}
          animate={play
            ? { opacity: [0.35, 1], filter: ["blur(4px)", "blur(0px)"], y: [4, 0] }
            : { opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.035 }}
          key={`${word}-${index}`}
        >
          {word}
        </m.span>
      ))}
    </span>
  );
}
