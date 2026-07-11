# Current

Current is a calm, typography-only daily tech briefing for software developers. It is statically generated, requires no database or account, and stores personal preferences only in the browser.

## Run locally

```bash
npm install
npm run refresh
npm run dev
```

Use `npm run build` to create the static site in `out/`. The build also produces a Pagefind search index for the exported pages.

## How content moves

The scheduled GitHub workflow fetches the approved feeds in `config/sources.json`, keeps publisher-provided excerpts, classifies and deduplicates stories deterministically, writes daily and weekly JSON under `public/data`, verifies the project, and commits the new edition. A Vercel Git integration can deploy that commit as a static site.

The collector deliberately fails without replacing the previous edition when fewer than six valid stories are available. Source failures are otherwise isolated so one unavailable feed cannot stop a healthy briefing.

## Product constraints

- No database, server API, authentication, or AI summarization.
- No logos, icons, images, video, decorative vector art, or emoji.
- Motion is limited to short editorial reveals and interaction feedback, with reduced-motion support.
- React Bits is limited to the locally owned `BlurText` heading component.
- shadcn-style components are source-owned and limited to text buttons, inputs, menus, and toggle groups.
