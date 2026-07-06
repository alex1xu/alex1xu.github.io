import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Dependency-free sitemap. Static routes plus every blog post, each with its
// last-modified date so crawlers see fresh posts promptly.
export const GET: APIRoute = async ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? '';
  const posts = await getCollection('blog');

  const staticPaths = ['', '/about', '/blog'];
  const urls: { loc: string; lastmod?: string }[] = [
    ...staticPaths.map((p) => ({ loc: `${base}${p}` })),
    ...posts.map((post) => ({
      loc: `${base}/blog/${post.id}`,
      lastmod: new Date(post.data.date).toISOString().split('T')[0],
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
