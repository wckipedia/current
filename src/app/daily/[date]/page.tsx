import { notFound } from "next/navigation";
import { PageReveal } from "@/components/motion/page-reveal";
import { Briefing } from "@/components/news/briefing";
import { getBriefing, getManifest } from "@/lib/content";

export function generateStaticParams() {
  return getManifest().dates.map((date) => ({ date }));
}

export default async function DailyPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const currentManifest = getManifest();
  if (!currentManifest.dates.includes(date)) notFound();
  const briefing = getBriefing(date);
  return <PageReveal><header className="page-intro compact"><p className="eyebrow">Daily briefing</p><h1>{new Date(`${date}T00:00:00+08:00`).toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long" })}</h1><p className="lede">The edition published on this day.</p></header><Briefing briefing={briefing} /></PageReveal>;
}
