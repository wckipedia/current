import type { Metadata } from "next";
import { PageReveal } from "@/components/motion/page-reveal";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <PageReveal><header className="page-intro compact"><p className="eyebrow">Local preferences</p><h1>Make the briefing yours.</h1><p className="lede">Choose what deserves space. These preferences never leave this device.</p></header><SettingsForm /></PageReveal>;
}
