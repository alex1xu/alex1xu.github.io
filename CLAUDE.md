# me — personal website

Astro 6 static site. Source: `~/dev/me/`. Remote: `git@github.com:alex1xu/me.git`.
Deployed on Vercel.

## Stack

- **Astro 6** with MDX integration (`@astrojs/mdx`)
- **Pages**: `src/pages/index.astro` (Home — Experience + Education), `src/pages/about.astro` (About — bio + photos), `src/pages/blog/index.astro` (Blog — learning log + post list), `src/pages/blog/[...slug].astro` (post pages)
- **Content collection**: `src/content/blog/` — all posts are `.mdx` files
- **Layouts**: `src/layouts/Base.astro` (shell), `src/layouts/Post.astro` (blog posts)
- **Components**: `Hero.astro` (shared name/links/nav header — identical on every page), `LearningLog.astro` (List + Calendar views), `ShareButton.astro` (copy-link icon), `Video.astro` (embed wrapper)
- **Global CSS**: `src/styles/global.css` — single file, CSS custom properties, no framework
- **Images**: life photos in `src/assets/photos/` rendered via `astro:assets` `<Image>` (responsive webp, lazy). Logos in `public/logos/` referenced by path.

## Commands

```
npm run dev      # dev server at localhost:4321
npm run build    # static build → dist/
npm run preview  # preview built output
```

## Editing content (no code — just data/files)

Both of these are designed so updates are a one-file change on GitHub, no component edits.

**Add a blog post** — create `src/content/blog/<slug>.mdx`:

```mdx
---
title: "Post title"
date: "2026-06-01"
description: "Optional subtitle shown in meta."
tags: ["tag1", "tag2"]
---

import Video from '../../components/Video.astro';

Post body in MDX. Supports fenced code blocks (shiki, github-light),
`<Video src="youtube-id-or-url" />`, and markdown images.
```

Filename = URL slug (`hello-world.mdx` → `/blog/hello-world`). Every post gets a copy-link share icon automatically.

**Update the learning log** — edit `src/data/learning.json`. Add or change one object; nothing else to touch:

```json
{ "date": "2026-06-20", "title": "Short heading", "status": "upcoming",
  "items": ["topic or paper", "another"], "blog": "optional-post-slug" }
```

- `status`: `"upcoming"` or `"done"` (only two).
- `items`: bullet list of topics/papers for that day.
- `links` (optional): array of `{"label": "...", "url": "..."}` — shown clickable in list view and in the calendar hover/click popover.
- `blog` (optional): a post slug to link "Read the write-up →".
- `phase` (optional): label like `"Phase 0 · D1"` shown as a subdued line.
- The List view shows the next **4** upcoming with a "Show more" toggle and Upcoming/Done filter; the Calendar view renders a month grid with click/hover popovers. Both derive entirely from this file.

## Voice & style — blog posts and site content ONLY

**Scope:** these rules apply exclusively to writing or editing `.mdx` blog posts and site prose (About, bio). They do NOT apply to code comments, commit messages, PR descriptions, or any other engineering output — those follow the global `~/.claude/CLAUDE.md §1–3` rules (terse, precise, no filler).

When editing blog content: **preserve Alex's wording by default.** Tighten and format; don't rewrite. "Do not change except formatting" is the default unless a rewrite is explicitly requested.

- **First person, casual but substantive.** Conversational, not corporate. Short paragraphs — break up long blocks.
- **Concrete over abstract.** Specific courses, metrics, dates, paper titles + arXiv IDs. Numbers carry the point (e.g. "85% parity", "1.2k RPS", "10×"). No vague hype.
- **Dry humor and parenthetical asides are on-brand** — ("(I only liked playing video games haha)"). Don't sand them off.
- **Technical depth for a systems/ML audience** — kernels, distributed training, inference, compilers, hardware. Assume a competent reader; explain tradeoffs and design decisions, not basics.
- **No AI-slop.** No "In today's fast-paced world", no hedging filler, no restating the heading, no bullet lists where prose reads better. Cut any sentence that carries no information.
- **Minimal/uncrowded.** Alex actively trims clutter. Prefer fewer, denser elements; short blocks; whitespace.

## Design principles

- Minimal, clean, content-first. No clutter. No navbar — navigation lives in the centered `Hero` (name → links → nav), identical across pages.
- All styling in `src/styles/global.css` — edit there, not inline. Palette/spacing via `:root` custom properties. Warm palette (cream/terracotta/sage), Fraunces serif headings + Inter body.
- Keep JS minimal — Astro ships zero JS by default. The only client JS is the learning-log toggles and the copy-link button, both progressive-enhancement (work/degrade gracefully without JS).

## Deploy gotchas (learned the hard way)

- **Commit author email** must be Alex's personal GitHub identity (`65417426+alex1xu@users.noreply.github.com`), not the Databricks work email — Vercel blocks deploys otherwise. The repo-local git config is already set; verify with `git log -1 --format='%ae'` before pushing.
- **`package-lock.json` registry**: building on arca writes the internal Databricks proxy host (`npm-proxy.cloud.databricks.com`) into every `resolved` URL, which CI can't reach (npm dies with "Exit handler never called!"). After any `npm install` on arca, re-sanitize before pushing:
  `sed -i 's#https://npm-proxy\.cloud\.databricks\.com/#https://registry.npmjs.org/#g' package-lock.json` (then confirm `grep -c npm-proxy package-lock.json` is 0).
- `engines.node` is pinned to `24.x` to match the Vercel project default.

Vercel: connect repo, framework = Astro, no extra config. GitHub Pages also works (`output: 'static'` is the default).
