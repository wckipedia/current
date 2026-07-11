import type { Metadata } from "next";
import Link from "next/link";
import { PageReveal } from "@/components/motion/page-reveal";
import { getManifest } from "@/lib/content";

export const metadata: Metadata = { title: "Archive" };

export default function ArchivePage() {
  const currentManifest = getManifest();
  return <PageReveal><header className="page-intro compact"><p className="eyebrow">Daily editions</p><h1>Return to a change.</h1><p className="lede">Every briefing remains available as a dated, permanent reading list.</p></header><div className="archive-list">{currentManifest.dates.map((date) => <Link className="archive-link" href={`/daily/${date}`} key={date}>{new Date(`${date}T00:00:00+08:00`).toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</Link>)}</div></PageReveal>;
}
