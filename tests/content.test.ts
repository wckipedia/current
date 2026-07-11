import { describe, expect, it } from "vitest";
import { categories } from "@/types/content";
import { flattenArticles } from "@/lib/utils";
import { getCurrentBriefing } from "@/lib/content";

describe("content contracts", () => {
  it("keeps the approved category taxonomy stable", () => {
    expect(categories).toHaveLength(10);
    expect(new Set(categories).size).toBe(categories.length);
  });

  it("flattens section articles in editorial order", () => {
    const articles = [{ id: "first" }, { id: "second" }] as never[];
    expect(flattenArticles([{ articles }]).map((article) => article.id)).toEqual(["first", "second"]);
  });

  it("keeps generated detail points distinct from publisher descriptions", () => {
    const currentBriefing = getCurrentBriefing();
    for (const article of flattenArticles(currentBriefing.sections)) {
      const description = article.excerpt.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const point of article.details ?? []) {
        expect(point.toLowerCase().replace(/[^a-z0-9]/g, "")).not.toBe(description);
      }
    }
  });
});
