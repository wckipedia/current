"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { readPreferences, readPreferencesSnapshot, subscribePreferences, writePreferences } from "@/lib/storage";
import { categories, type Category } from "@/types/content";

export function SettingsForm() {
  const snapshot = useSyncExternalStore(subscribePreferences, readPreferencesSnapshot, () => "");
  const stored = useMemo(() => snapshot ? readPreferences() : { categories: [], quietMode: false }, [snapshot]);
  const [selectedOverride, setSelected] = useState<Category[] | null>(null);
  const [quietOverride, setQuietMode] = useState<boolean | null>(null);
  const selected = selectedOverride ?? stored.categories;
  const quietMode = quietOverride ?? stored.quietMode;
  const [status, setStatus] = useState("");

  function save() {
    writePreferences({ categories: selected, quietMode });
    setStatus("Settings updated on this device.");
  }

  function exportData() {
    const value = JSON.stringify({ preferences: { categories: selected, quietMode } }, null, 2);
    const blob = new Blob([value], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "current-settings.json";
    anchor.click();
    URL.revokeObjectURL(href);
  }

  async function importData(file: File | undefined) {
    if (!file) return;
    try {
      const value = JSON.parse(await file.text()) as { preferences?: { categories?: Category[]; quietMode?: boolean } };
      const importedCategories = (value.preferences?.categories ?? []).filter((category): category is Category => categories.includes(category));
      const importedQuietMode = Boolean(value.preferences?.quietMode);
      writePreferences({ categories: importedCategories, quietMode: importedQuietMode });
      setSelected(importedCategories);
      setQuietMode(importedQuietMode);
      setStatus("Imported and saved on this device.");
    } catch {
      setStatus("That file could not be imported. Choose a Current settings file.");
    }
  }

  return (
    <div className="settings-form">
      <fieldset>
        <legend>Preferred categories</legend>
        <p>Leave everything unselected to see the complete briefing.</p>
        <ToggleGroup type="multiple" value={selected} onValueChange={(value) => setSelected(value as Category[])}>
          {categories.map((category) => <ToggleGroupItem key={category} value={category}>{category}</ToggleGroupItem>)}
        </ToggleGroup>
      </fieldset>
      <fieldset>
        <legend>Reading density</legend>
        <p>Quiet mode shows one story in each category.</p>
        <ToggleGroup type="single" value={quietMode ? "quiet" : "complete"} onValueChange={(value) => value && setQuietMode(value === "quiet")}>
          <ToggleGroupItem value="complete">Complete</ToggleGroupItem>
          <ToggleGroupItem value="quiet">Quiet</ToggleGroupItem>
        </ToggleGroup>
      </fieldset>
      <div className="settings-actions"><Button variant="selected" onClick={save}>Save settings</Button><Button onClick={exportData}>Export data</Button><label className="file-action">Import data<input accept="application/json" className="sr-only" type="file" onChange={(event) => void importData(event.target.files?.[0])} /></label></div>
      <p aria-live="polite" className="save-status">{status}</p>
    </div>
  );
}
