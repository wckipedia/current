"use client";

import { m } from "motion/react";

export function PageReveal({ children }: { children: React.ReactNode }) {
  return (
    <m.div initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
      {children}
    </m.div>
  );
}
