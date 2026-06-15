---
description: Capture a raw learning note into the private learning-notes repo (PST-dated), with optional file artifacts; `wrap` mode prompts for comprehensiveness.
---

Capture a learning note. Arguments: `$ARGUMENTS`

The notes live in a **separate private repo** at `~/dev/private-learning-notes/`, NOT in this repo. Day folders are keyed to America/Los_Angeles date so they're stable regardless of where this instance runs.

## Setup constants

- `ND=~/dev/private-learning-notes`
- `TODAY=$(TZ='America/Los_Angeles' date +%Y-%m-%d)`
- `NOW=$(TZ='America/Los_Angeles' date +%H:%M)`
- Today's file: `$ND/$TODAY/notes.md`; artifacts: `$ND/$TODAY/artifacts/`

## Mode detection

Look at `$ARGUMENTS`:
- Starts with `wrap` → **Wrap mode** (end-of-session comprehensiveness pass).
- Starts with `sync` → **Sync mode** (manual commit+push, then stop).
- Anything else (or a quick fragment) → **Quick-add mode**. This is the default and must be FAST — do not ask questions, do not editorialize, just file it.

## Step 1 — new-day rollover (run in every mode before writing)

```bash
ND=~/dev/private-learning-notes
TODAY=$(TZ='America/Los_Angeles' date +%Y-%m-%d)
# Any prior (non-today) day folders with uncommitted changes? Commit + push them.
cd "$ND"
PRIOR=$(git status --porcelain | grep -v "$TODAY/" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}/' | sort -u)
if [ -n "$PRIOR" ]; then
  git add -A
  git commit -q -m "notes: $(echo "$PRIOR" | tr -d '/' | tr '\n' ' ')" || true
  git push -q origin main 2>/dev/null || git push -q -u origin main
fi
mkdir -p "$ND/$TODAY/artifacts"
[ -f "$ND/$TODAY/notes.md" ] || printf '# %s\n\n' "$TODAY" > "$ND/$TODAY/notes.md"
```

Today's notes stay UNcommitted (still editable) until the next day rolls over. Don't commit today's file in quick-add/wrap mode.

## Step 2 — quick-add mode

1. Parse `$ARGUMENTS`: any token that looks like a file path (`~/...`, `/...`, `./...`, or an existing file) is an **artifact**; the rest is the note text.
2. For each artifact path: copy it into `$ND/$TODAY/artifacts/` (keep the basename; if it collides, prefix with `$NOW` → `1742-trace.png`). Use `cp`.
3. Append to `$ND/$TODAY/notes.md`:
   ```
   ## HH:MM — <note text>

   ![caption](artifacts/<file>)   ← one line per artifact, image syntax for images, plain link otherwise
   ```
4. Confirm in one line: `noted → 2026-06-01/notes.md (+1 artifact)`. Nothing more. Do not summarize the note back.

If `$ARGUMENTS` is empty in quick-add mode, ask only: "What's the note?" — nothing else.

## Step 3 — wrap mode

End-of-session pass to make the day comprehensive. Keep it light — this is an aid, not a gate.

1. Read `$ND/$TODAY/notes.md`.
2. Map what's there against the five buckets:
   - **Stuck points** — anything that cost >30 min + resolution
   - **Numbers** — benchmarks / profiler stats with config
   - **Wrong assumptions** — expected X, got Y
   - **Connections** — same idea as an earlier topic
   - **Artifacts** — commits, kernels, screenshots
3. Identify the 2–3 buckets that are thin or empty for today. Ask ONLY about those, batched into a single `AskUserQuestion` (or a short plain prompt). Never interrogate all five. Frame as "anything to add on X?" — easy to skip with "no".
4. Append whatever they give under a `## HH:MM — wrap` section. If they add nothing, say so and stop. Do not push (rollover handles that tomorrow).

## Step 4 — sync mode

Force a commit+push of everything including today:
```bash
cd ~/dev/private-learning-notes && git add -A && git commit -q -m "notes: manual sync" && (git push -q origin main 2>/dev/null || git push -q -u origin main)
```
Report the result.

## Rules

- Commit author email in the notes repo is already set to the personal no-reply address — do not change it.
- Never write notes into the `me` repo working tree. They go to `~/dev/private-learning-notes/` only.
- Speed over polish in quick-add. The whole point is zero friction.
