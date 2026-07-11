"use client";

import { m } from "motion/react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Article } from "@/types/content";
import { ArticleRow } from "./article-row";

export function SearchView({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return articles.filter((article) => [article.title, article.excerpt, article.source, article.category, ...article.technologies].join(" ").toLowerCase().includes(normalized));
  }, [articles, query]);

  return (
    <div>
      <label className="sr-only" htmlFor="search">Search stories</label>
      <Input autoComplete="off" autoFocus id="search" onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, technologies, or sources" value={query} />
      <m.p aria-live="polite" className="search-status" initial={false} animate={{ opacity: 1 }}>{query ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Start typing to search the archive."}</m.p>
      {results.map((article, index) => <ArticleRow article={article} index={index} key={article.id} />)}
    </div>
  );
}
