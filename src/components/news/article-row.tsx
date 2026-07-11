"use client";

import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import type { Article } from "@/types/content";

function cleanPublisherExcerpt(value: string) {
  return value
    .replace(/[—–]/g, "-")
    .replace(/\s+The post .+? appeared first on .+?\s*\.?\s*$/i, "")
    .replace(/\s+Continue reading\.?\s*$/i, "")
    .trim();
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function ArticleRow({ article, index = 0 }: { article: Article; index?: number }) {
  const [open, setOpen] = useState(false);
  const detailsId = `article-${article.id}-details`;
  const publishedDate = new Date(article.publishedAt).toLocaleDateString("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const summary = cleanPublisherExcerpt(article.excerpt);
  const details = (article.details ?? [])
    .map(cleanPublisherExcerpt)
    .filter((point) => point.length > 0 && normalizeText(point) !== normalizeText(summary));

  return (
    <m.article
      className="article-row"
      data-pagefind-body
      initial={false}
      layout
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        layout: { duration: 0.24 },
        opacity: { duration: 0.2, delay: Math.min(index, 3) * 0.03 },
        y: { duration: 0.2, delay: Math.min(index, 3) * 0.03 },
      }}
    >
      <div className="article-byline">
        <p>{publishedDate}</p>
        <p>Published by {article.source}</p>
      </div>
      <h3>
        <button
          aria-controls={detailsId}
          aria-expanded={open}
          aria-label={`${open ? "Hide" : "Show"} more details about ${article.title}`}
          className="story-trigger"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {article.title}
        </button>
      </h3>
      <p className="article-excerpt">{summary}</p>
      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            id={detailsId}
            initial={{ opacity: 0, y: -6 }}
            key="details"
            transition={{ duration: 0.2 }}
          >
            <div className="article-details">
              {details.length ? <ul className="article-facts">
                {details.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul> : <p className="details-unavailable">No additional detail was provided in this source feed.</p>}
              {article.related?.length ? <a className="text-action related-action" href={article.related[0].url} rel="noreferrer" target="_blank">More coverage</a> : null}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
      <div className="article-actions">
        <a className="text-action" href={article.url} rel="noreferrer" target="_blank">Read original</a>
      </div>
    </m.article>
  );
}
