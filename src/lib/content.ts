import fs from "node:fs";
import path from "node:path";
import type { DailyBriefing, Manifest, WeeklyEdition } from "@/types/content";

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", relativePath), "utf8")) as T;
}

export function getManifest() {
  return readJson<Manifest>("manifest.json");
}

export function getCurrentBriefing() {
  const manifest = getManifest();
  return readJson<DailyBriefing>(`daily/${manifest.currentDate}.json`);
}

export function getCurrentWeekly() {
  const manifest = getManifest();
  return readJson<WeeklyEdition>(`weekly/${manifest.currentWeek}.json`);
}

export function getBriefing(date: string) {
  return readJson<DailyBriefing>(`daily/${date}.json`);
}
