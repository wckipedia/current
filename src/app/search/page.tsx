import type { Metadata } from "next";
import { PageReveal } from "@/components/motion/page-reveal";
import { SearchView } from "@/components/news/search-view";
import { getBriefing, getManifest } from "@/lib/content";
import { flattenArticles } from "@/lib/utils";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  const currentManifest = getManifest();
  const articles = currentManifest.dates.flatMap((date) => flattenArticles(getBriefing(date).sections));
  const uniqueArticles = [...new Map(articles.map((article) => [article.id, article])).values()];
  return <PageReveal><header className="page-intro compact"><p className="eyebrow">Archive search</p><h1>Find the thread.</h1><p className="lede">Search every edition by technology, source, or idea.</p></header><SearchView articles={uniqueArticles} /></PageReveal>;
}
