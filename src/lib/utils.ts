import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPublished(value: string) {
  const date = new Date(value);
  const hours = Math.floor((Date.now() - date.getTime()) / 3_600_000);
  if (hours < 1) return "Less than an hour ago";
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  return date.toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}

export function flattenArticles(sections: { articles: import("@/types/content").Article[] }[]) {
  return sections.flatMap((section) => section.articles);
}
