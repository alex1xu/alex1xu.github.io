# me — personal website

Astro 6 static site. Source: `~/dev/me/`. Remote: `git@github.com:alex1xu/me.git`.

## Stack

- **Astro 6** with MDX integration (`@astrojs/mdx`)
- **Content collection**: `src/content/blog/` — all posts are `.mdx` files
- **Layouts**: `src/layouts/Base.astro` (shell), `src/layouts/Post.astro` (blog posts)
- **Global CSS**: `src/styles/global.css` — single file, CSS custom properties, no framework
- **Components**: `src/components/Video.astro` — YouTube/iframe embed wrapper

## Commands

```
npm run dev      # dev server at localhost:4321
npm run build    # static build → dist/
npm run preview  # preview built output
```

## Adding a blog post

Create `src/content/blog/<slug>.mdx` with frontmatter:

```mdx
---
title: "Post title"
date: "2026-06-01"
description: "Optional subtitle shown in meta."
tags: ["tag1", "tag2"]
---

import Video from '../../components/Video.astro';

Post body in MDX. Supports:
- Fenced code blocks with syntax highlighting (shiki, github-light theme)
- `<Video src="youtube-id-or-url" />` for video embeds
- Standard markdown images: ![alt](./image.png) — put images in public/ or alongside the post
```

The slug in the URL is the filename (e.g. `hello-world.mdx` → `/blog/hello-world`).

## Design principles

- Minimal, clean, content-first. No clutter.
- All styling is in `src/styles/global.css` — edit there, not inline.
- Color palette and spacing via CSS custom properties at `:root`.
- No JS unless strictly needed — Astro ships zero JS by default.

## Deployment

Vercel (connect repo, framework = Astro, no extra config needed). GitHub Pages also works with `output: 'static'` (already set as default).

## About page

Edit `src/pages/about.astro` directly — it's static prose, no collection needed.
