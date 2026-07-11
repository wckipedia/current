import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import { categories, type Article, type Category, type DailyBriefing, type Manifest, type WeeklyEdition } from "../src/types/content";

const sourceSchema = z.object({
  name: z.string(),
  url: z.url(),
  defaultCategory: z.enum(categories),
  weight: z.number().min(1).max(10),
});

type Source = z.infer<typeof sourceSchema>;
type Candidate = Article & { score: number };

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text" });
const root = process.cwd();
const dataRoot = path.join(root, "public", "data");

const technologyRules: Array<[string, RegExp]> = [
  ["React", /\breact\b/i], ["Next.js", /\bnext(?:\.js)?\b/i], ["TypeScript", /\btypescript\b/i],
  ["JavaScript", /\bjavascript\b/i], ["Python", /\bpython\b/i], ["Rust", /\brust\b/i],
  ["Go", /\bgolang\b|\bgo language\b/i], ["Kubernetes", /\bkubernetes\b|\bk8s\b/i], ["Docker", /\bdocker\b/i],
  ["GitHub", /\bgithub\b/i], ["Chrome", /\bchrome\b/i], ["WebAssembly", /\bwebassembly\b|\bwasm\b/i],
  ["Linux", /\blinux\b/i], ["Node.js", /\bnode(?:\.js)?\b/i], ["OpenAI", /\bopenai\b/i],
];

const categoryRules: Array<[Category, RegExp]> = [
  ["Security", /security|vulnerabilit|malware|exploit|cve|authentication|passkey/i],
  ["AI", /\bai\b|artificial intelligence|machine learning|model|agent|llm/i],
  ["DevOps", /kubernetes|docker|container|deployment|ci\/cd|observability/i],
  ["Cloud", /cloud|serverless|edge network|data center|database/i],
  ["Web", /browser|css|html|javascript|web platform|chrome/i],
  ["Languages", /rust|python|typescript|javascript|compiler|language release/i],
  ["Open Source", /open source|maintainer|foundation|community release/i],
  ["Developer Tools", /github|ide|editor|developer tool|sdk|api/i],
  ["Mobile", /android|ios|swift|mobile/i],
  ["Backend", /backend|database|postgres|api|runtime|distributed system/i],
];

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) return text((value as { "#text": unknown })["#text"]);
  return "";
}

function stripMarkup(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, "\"")
    .replace(/&rsquo;|&lsquo;/g, "'").replace(/&rdquo;|&ldquo;/g, "\"")
    .replace(/&mdash;|&ndash;/g, "-").replace(/&hellip;/g, "...")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ").trim();
}

function excerpt(value: string): string {
  const clean = stripMarkup(value);
  if (clean.length <= 310) return clean;
  const shortened = clean.slice(0, 310);
  return `${shortened.slice(0, shortened.lastIndexOf(" "))}…`;
}

function detailPoints(value: string, title: string, summary: string): string[] {
  const readableValue = value
    .replace(/^Title:.*$/gim, "")
    .replace(/^URL Source:.*$/gim, "")
    .replace(/^Markdown Content:.*$/gim, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s*⁠?\(opens in a new window\)/gi, "");
  const htmlBlocks = [...readableValue.matchAll(/<(p|li)\b[^>]*>[\s\S]*?<\/\1>/gi)].map((match) => stripMarkup(match[0]));
  const plainSentences = stripMarkup(readableValue.replace(/<br\s*\/?>/gi, ". ").replace(/<\/(p|li|div|h[1-6])>/gi, ". "))
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/);
  const sourcePoints = (htmlBlocks.length >= 3 ? htmlBlocks : plainSentences).flatMap((point) =>
    point.length > 420 ? point.split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/) : [point],
  );
  const candidates = sourcePoints
    .map((point) => point.replace(/[—–]/g, "-").replace(/\s+/g, " ").trim())
    .filter((point) => point.length >= 55 && point.length <= 420)
    .filter((point) => !/subscribe|newsletter|cookie|all rights reserved|appeared first|continue reading/i.test(point))
    .filter((point) => !point.toLowerCase().includes(title.toLowerCase()))
    .filter((point) => !point.includes(summary.slice(0, 80)));

  const unique: string[] = [];
  for (const point of candidates) {
    const normalized = point.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (unique.some((known) => known.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized)) continue;
    unique.push(point);
    if (unique.length === 5) break;
  }
  return unique;
}

async function fetchReadableArticle(url: string): Promise<string> {
  const readerUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`;
  const response = await fetch(readerUrl, {
    headers: { accept: "text/plain", "user-agent": "Current briefing generator/1.0" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Reader returned ${response.status}`);
  return response.text();
}

function resolveLink(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const preferred = value.find((item) => item?.["@_rel"] === "alternate") ?? value[0];
    return preferred?.["@_href"] ?? text(preferred);
  }
  if (value && typeof value === "object") return String((value as Record<string, unknown>)["@_href"] ?? "");
  return "";
}

function classify(value: string, fallback: Category): Category {
  return categoryRules.find(([, rule]) => rule.test(value))?.[0] ?? fallback;
}

function technologies(value: string): string[] {
  const matches = technologyRules.filter(([, rule]) => rule.test(value)).map(([name]) => name);
  return matches.length ? matches.slice(0, 4) : ["Software Engineering"];
}

type FeedEntry = Record<string, unknown>;

function normalizeEntries(document: unknown): FeedEntry[] {
  const root = document as { rss?: { channel?: { item?: unknown } }; feed?: { entry?: unknown } };
  const entries = root?.rss?.channel?.item ?? root?.feed?.entry ?? [];
  const list = Array.isArray(entries) ? entries : [entries];
  return list.filter((entry): entry is FeedEntry => Boolean(entry) && typeof entry === "object");
}

async function fetchSource(source: Source): Promise<Candidate[]> {
  const response = await fetch(source.url, { headers: { "user-agent": "Current briefing generator/1.0" }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`${source.name} returned ${response.status}`);
  const document: unknown = parser.parse(await response.text());
  const candidates: Candidate[] = [];
  for (const entry of normalizeEntries(document).slice(0, 8)) {
    const title = stripMarkup(text(entry.title));
    const url = resolveLink(entry.link) || text(entry.guid);
    const description = text(entry.description) || text(entry.summary) || text(entry.content) || text(entry["content:encoded"]);
    const fullContent = text(entry["content:encoded"]) || text(entry.content) || description;
    const publishedAt = new Date(text(entry.pubDate) || text(entry.published) || text(entry.updated) || Date.now()).toISOString();
    const publisherExcerpt = excerpt(description);
    if (!title || !url || !publisherExcerpt) continue;
    const combined = `${title} ${publisherExcerpt}`;
    const ageHours = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 3_600_000);
    const freshness = Math.max(0, 8 - ageHours / 24);
    let details = detailPoints(fullContent, title, publisherExcerpt);
    if (details.length < 3) {
      try {
        const readableArticle = await fetchReadableArticle(url);
        const readerDetails = detailPoints(readableArticle, title, publisherExcerpt);
        if (readerDetails.length > details.length) details = readerDetails;
      } catch {
        // Preserve feed-only operation when the approved article page is unavailable.
      }
    }
    candidates.push({
      id: createHash("sha256").update(url.replace(/[?#].*$/, "")).digest("hex").slice(0, 16),
      title,
      excerpt: publisherExcerpt,
      source: source.name,
      url,
      publishedAt,
      technologies: technologies(combined),
      category: classify(combined, source.defaultCategory),
      scanMinutes: Math.max(1, Math.ceil((title.split(/\s+/).length + publisherExcerpt.split(/\s+/).length) / 180)),
      details,
      score: source.weight + freshness,
    });
  }
  return candidates;
}

function deduplicate(candidates: Candidate[]): Candidate[] {
  const seenUrls = new Set<string>();
  const seenTitles: string[] = [];
  return candidates.sort((a, b) => b.score - a.score).filter((article) => {
    const url = article.url.replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/$/, "");
    const title = article.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
    const duplicate = seenUrls.has(url) || seenTitles.some((known) => known === title || (title.length > 40 && known.includes(title.slice(0, 40))));
    if (!duplicate) { seenUrls.add(url); seenTitles.push(title); }
    return !duplicate;
  });
}

function singaporeDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function isoWeek(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function main() {
  const rawSources = JSON.parse(await fs.readFile(path.join(root, "config", "sources.json"), "utf8"));
  const sources = z.array(sourceSchema).parse(rawSources);
  const settled = await Promise.allSettled(sources.map(fetchSource));
  const healthy = settled.filter((result) => result.status === "fulfilled").length;
  const articles = deduplicate(settled.flatMap((result) => result.status === "fulfilled" ? result.value : [])).slice(0, 24);
  if (articles.length < 6) throw new Error(`Only ${articles.length} valid articles were collected; preserving the previous edition.`);
  const sections = categories.flatMap((name) => {
    const matches = articles.filter((article) => article.category === name).slice(0, 4).map((candidate): Article => ({
      id: candidate.id, title: candidate.title, excerpt: candidate.excerpt, source: candidate.source, url: candidate.url,
      publishedAt: candidate.publishedAt, technologies: candidate.technologies, category: candidate.category,
      scanMinutes: candidate.scanMinutes, readingMinutes: candidate.readingMinutes, details: candidate.details, related: candidate.related,
    }));
    return matches.length ? [{ name, articles: matches }] : [];
  });
  const date = singaporeDate();
  const week = isoWeek(date);
  const briefing: DailyBriefing = { date, generatedAt: new Date().toISOString(), sourceHealth: { healthy, attempted: sources.length }, sections };
  const weekly: WeeklyEdition = { week, generatedAt: briefing.generatedAt, sections: sections.map((section) => ({ ...section, articles: section.articles.slice(0, 3) })) };

  await fs.mkdir(path.join(dataRoot, "daily"), { recursive: true });
  await fs.mkdir(path.join(dataRoot, "weekly"), { recursive: true });
  await fs.writeFile(path.join(dataRoot, "daily", `${date}.json`), `${JSON.stringify(briefing, null, 2)}\n`);
  await fs.writeFile(path.join(dataRoot, "weekly", `${week}.json`), `${JSON.stringify(weekly, null, 2)}\n`);

  let previousDates: string[] = [];
  try { previousDates = (JSON.parse(await fs.readFile(path.join(dataRoot, "manifest.json"), "utf8")) as Manifest).dates; } catch {}
  const manifest: Manifest = { currentDate: date, currentWeek: week, dates: [...new Set([date, ...previousDates])].sort().reverse(), generatedAt: briefing.generatedAt };
  await fs.writeFile(path.join(dataRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${date}: ${articles.length} stories from ${healthy}/${sources.length} sources.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
