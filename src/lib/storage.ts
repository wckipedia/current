import type { Category } from "@/types/content";

export type LocalPreferences = {
  categories: Category[];
  quietMode: boolean;
};

const PREFERENCES_KEY = "current:preferences";

export function readPreferences(): LocalPreferences {
  if (typeof window === "undefined") return { categories: [], quietMode: false };
  try {
    return JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "{\"categories\":[],\"quietMode\":false}") as LocalPreferences;
  } catch {
    return { categories: [], quietMode: false };
  }
}

export function writePreferences(value: LocalPreferences) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("current:preferences"));
}

export function readPreferencesSnapshot() {
  return typeof window === "undefined" ? "" : localStorage.getItem(PREFERENCES_KEY) ?? "";
}

export function subscribePreferences(listener: () => void) {
  window.addEventListener("current:preferences", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("current:preferences", listener);
    window.removeEventListener("storage", listener);
  };
}
