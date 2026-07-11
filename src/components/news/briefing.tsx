"use client";

import { AnimatePresence, m } from "motion/react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { BlurText } from "@/components/react-bits/blur-text";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { readPreferences, readPreferencesSnapshot, subscribePreferences } from "@/lib/storage";
import type { DailyBriefing } from "@/types/content";
import { ArticleRow } from "./article-row";

export function Briefing({ briefing }: { briefing: DailyBriefing }) {
  const preferenceSnapshot = useSyncExternalStore(subscribePreferences, readPreferencesSnapshot, () => "");
  const stored = useMemo(() => preferenceSnapshot ? readPreferences() : { categories: [], quietMode: false }, [preferenceSnapshot]);
  const [activeOverride, setActiveOverride] = useState<string | null>(null);
  const active = activeOverride ?? stored.categories[0] ?? "";
  const quietMode = stored.quietMode;

  const sections = useMemo(
    () => briefing.sections.filter((section) => !active || active === section.name),
    [active, briefing.sections],
  );

  return (
    <>
      <div className="filter-block">
        <p className="utility-label">Filter the briefing</p>
        <ToggleGroup aria-label="Filter by category" onValueChange={setActiveOverride} type="single" value={active}>
          {briefing.sections.map((section) => <ToggleGroupItem key={section.name} value={section.name}>{section.name}</ToggleGroupItem>)}
        </ToggleGroup>
      </div>
      <AnimatePresence mode="popLayout">
        {sections.map((section) => (
          <m.section className="category-section" key={section.name} layout initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <h2><BlurText text={section.name} /></h2>
            {section.articles.slice(0, quietMode ? 1 : 4).map((article, index) => <ArticleRow article={article} index={index} key={article.id} />)}
          </m.section>
        ))}
      </AnimatePresence>
      {sections.length === 0 ? <p className="empty-copy">No stories match those categories. Clear the filters to read today’s briefing.</p> : null}
    </>
  );
}
