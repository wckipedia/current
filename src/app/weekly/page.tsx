import type { Metadata } from "next";
import { PageReveal } from "@/components/motion/page-reveal";
import { ArticleRow } from "@/components/news/article-row";
import { BlurText } from "@/components/react-bits/blur-text";
import { getCurrentWeekly } from "@/lib/content";

export const metadata: Metadata = { title: "Weekly" };

export default function WeeklyPage() {
  const currentWeekly = getCurrentWeekly();
  return <PageReveal><header className="page-intro compact"><p className="eyebrow">Week {currentWeekly.week.split("W")[1]}</p><h1>Seven days, in one sitting.</h1><p className="lede">The developments that held their relevance after the daily cycle moved on.</p></header>{currentWeekly.sections.map((section) => <section className="category-section" key={section.name}><h2><BlurText text={section.name} /></h2>{section.articles.map((article, index) => <ArticleRow article={article} index={index} key={article.id} />)}</section>)}</PageReveal>;
}
