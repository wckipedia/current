export const categories = [
  "AI",
  "Web",
  "Backend",
  "Cloud",
  "DevOps",
  "Security",
  "Mobile",
  "Languages",
  "Open Source",
  "Developer Tools",
] as const;

export type Category = (typeof categories)[number];

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  url: string;
  publishedAt: string;
  technologies: string[];
  category: Category;
  scanMinutes: number;
  readingMinutes?: number;
  details?: string[];
  related?: Array<{ title: string; source: string; url: string }>;
};

export type CategorySection = {
  name: Category;
  articles: Article[];
};

export type DailyBriefing = {
  date: string;
  generatedAt: string;
  sourceHealth: { healthy: number; attempted: number };
  sections: CategorySection[];
};

export type WeeklyEdition = {
  week: string;
  generatedAt: string;
  sections: CategorySection[];
};

export type Manifest = {
  currentDate: string;
  currentWeek: string;
  dates: string[];
  generatedAt: string;
};
