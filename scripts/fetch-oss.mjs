#!/usr/bin/env node
// Refresh src/data/oss.json from GitHub. Tracks PRs authored by AUTHOR in REPOS,
// keeping open and merged PRs and dropping closed-but-unmerged ones. Run by the
// update-oss workflow on a daily cron; runnable locally with GH_TOKEN set.
import { writeFile } from 'node:fs/promises';

const AUTHOR = 'alex1xu';
const REPOS = ['llvm/torch-mlir', 'pytorch/pytorch'];
const OUT = new URL('../src/data/oss.json', import.meta.url);

const q = [`author:${AUTHOR}`, 'type:pr', ...REPOS.map((r) => `repo:${r}`)].join(' ');
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'oss-tracker' };
if (process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;

const res = await fetch(`https://api.github.com/search/issues?per_page=100&q=${encodeURIComponent(q)}`, { headers });
if (!res.ok) {
  console.error(`GitHub API ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const { items = [] } = await res.json();

const prs = items.flatMap((it) => {
  const merged = it.pull_request?.merged_at;
  let status, date;
  if (merged) { status = 'merged'; date = merged; }
  else if (it.state === 'open') { status = 'open'; date = it.created_at; }
  else return []; // closed but unmerged → drop
  const repo = it.repository_url.split('/repos/')[1];
  return [{ repo, number: it.number, title: it.title, url: it.html_url, status, date: date.slice(0, 10) }];
});

const rank = { open: 0, merged: 1 };
prs.sort((a, b) => rank[a.status] - rank[b.status] || (a.date < b.date ? 1 : -1));

const generated = new Date().toISOString().slice(0, 10);
await writeFile(OUT, JSON.stringify({ generated, prs }, null, 2) + '\n');
console.log(`Wrote ${prs.length} PR(s) to src/data/oss.json`);
