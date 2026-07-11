import { PageReveal } from "@/components/motion/page-reveal";
import { Briefing } from "@/components/news/briefing";
import { BlurText } from "@/components/react-bits/blur-text";
import { getCurrentBriefing } from "@/lib/content";

export default function Home() {
  const currentBriefing = getCurrentBriefing();
  const briefingDate = new Date(`${currentBriefing.date}T00:00:00+08:00`);
  const weekday = briefingDate.toLocaleDateString("en-SG", { weekday: "long" });
  const date = briefingDate.toLocaleDateString("en-SG", { day: "numeric", month: "long", year: "numeric" });

  return (
    <PageReveal>
      <header className="page-intro">
        <h1 className="briefing-title">
          <span className="briefing-line"><BlurText text="Daily briefing" /></span>
          <span className="briefing-line"><BlurText text={weekday} /></span>
          <span className="briefing-line"><BlurText text={date} /></span>
        </h1>
      </header>
      <Briefing briefing={currentBriefing} />
    </PageReveal>
  );
}
