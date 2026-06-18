---
name: session-end-status-md
description: Update `tasks/todo.md` at the end of a working session on this repo so Daniel can pick the project back up days or weeks later from a single file. Use whenever the working session is wrapping up, the user signals they're done for the day, the user asks "where are we at" / "what did we do" / "wrap this up" / "save progress" / "save status", or whenever a Stop hook in this repo invokes this skill. Use even if the user has not explicitly named the file — the goal is to leave behind a clean handoff doc before context is lost.
---

# Session-end status doc for CourtSync

When a working session on this repo is ending, leave behind a clean handoff in `tasks/todo.md` at the repo root. The point of this doc is **future-Daniel coming back to the project after a gap** — days, sometimes weeks. He should be able to open one file and be caught up in under a minute.

## Why this matters

Daniel is building CourtSync as a learning project — depth over speed. He'll context-switch in and out of it around school, sometimes with long gaps. Without a status doc, every comeback starts with "what was I doing again?" — re-reading transcripts, grepping git log, mentally reconstructing. With a status doc kept fresh, comeback time drops to reading one file.

The doc is also useful for *you* (Claude) at the start of a fresh session — it gives you a quick, structured read on the project state without having to re-derive it from scratch.

## The recipe

Update `tasks/todo.md` at the repo root with exactly **three sections, in this order**:

1. **What we did this session** — concise bullets, past tense, factual. Capture concrete outcomes (files created, tools installed, commits made, decisions reached), not narrative ("then we tried X, then Y broke, then..."). Include specific versions/values that matter (e.g., "Next.js 16.2.6", "Java 26 via SDKMAN") so future-Daniel doesn't have to dig them up. **Replace** this section each session — don't append to it. Old "did this" content goes stale fast and bloats the file.

2. **What's unfinished / open questions** — checkbox items (`- [ ]`) for things started but not finished, plus open decisions Daniel hasn't made yet (e.g., "decide what to do with design docs — commit / gitignore / move"). These carry forward across sessions until resolved. Tick them off (`- [x]`) when done. Prune resolved items occasionally so this section doesn't accumulate noise.

3. **What's next** — **scoped to exactly ONE phase**, not a multi-phase roadmap. Include:
   - A **scope** sentence stating what the phase covers and, crucially, the *done-when* criterion (e.g., "Done when `./gradlew bootRun` boots clean and Flyway logs V1 applied").
   - A **checklist** of concrete steps with checkboxes.
   - An **out of scope** sub-section listing later phases by name only (one line each), so they're parked but not forgotten.

   When the current "What's next" phase is finished, **replace** the section with the next phase. Don't stack phases — that defeats the point of tight scoping.

Plus one detail at the very top: a `_Last updated: YYYY-MM-DD_` line so it's obvious at a glance whether the doc is fresh or stale.

## Tight scope is a feature, not a limitation

The temptation when writing "What's next" is to dump in everything that needs to happen eventually. Resist that. A phase should be small enough that Daniel can finish it in one or two focused sessions. If it stretches into three or more, the phase is too big and should be split.

Concretely: "Wire backend to Supabase + write first Flyway migration" is one phase. "Wire backend to Supabase + Flyway migration + JWT auth + first controller + Stripe scaffolding" is five phases pretending to be one, and it will overwhelm both Daniel and you when you come back to it.

Out-of-scope items belong in the "Out of scope" sub-section of the current phase — that's where Phase 1b, 1c, etc. live until they're promoted to "What's next."

## What does NOT belong in this file

- **Lessons learned from corrections** → `tasks/lessons.md`. The two files have different jobs: `todo.md` is "where are we / what's next," `lessons.md` is "what patterns to remember across sessions." Mixing them muddles both.
- **Design decisions and architecture** → `docs/superpowers/specs/...`. The status doc points at specs; it doesn't replicate them.
- **Long narrative recaps** → not anywhere. Bullets only. Future-Daniel skims this; he doesn't read prose.
- **Notes-to-self or ideas that aren't actionable yet** → fine to capture briefly under "Unfinished / open questions," but if it's just a vague idea, leave it out.

## When to write it

- **Primary trigger:** the session is ending. Either Daniel says so ("let's wrap up", "I'm done for today", "save progress"), or a Stop hook fires this skill automatically before the conversation closes.
- **Secondary trigger:** Daniel asks "where are we?" or "what did we do today?" — treat that as a request to update the doc and then summarize it back.
- **Mid-session:** if a major milestone lands (a phase finishes, a tricky thing gets unblocked), it's fine to update the doc in real time so progress doesn't risk getting lost.

Don't write it at the *start* of a session — at session start, you *read* the existing doc to orient, not overwrite it.

## How to write it well

- **Past tense, present clarity.** "Scaffolded the frontend" not "We're going to scaffold the frontend." The reader is future-Daniel after a gap — write what's already true.
- **Surface what's surprising or non-obvious.** If something went sideways and required a workaround, note the workaround briefly (e.g., "installed SDKMAN via Homebrew bash because macOS stock bash is 3.2"). Skip the obvious.
- **Link, don't duplicate.** If a spec or commit captures the detail, point at it. The status doc is an index, not an archive.
- **Date in the body, not just frontmatter.** The `_Last updated:_` line gives a fast freshness check.
- **No emojis, no decorative headers.** Plain markdown. Daniel will read this in a terminal or plain editor as often as in a renderer.

## Canonical example

A real example of this format already exists in the repo at `tasks/todo.md` (first written 2026-05-13 after the scaffold session). Read it to see the format in action — sections, checkbox style, "Out of scope" sub-section, length, tone. Match that style when you write new versions. If you find yourself drifting from that template, stop and re-align.

## Quick checklist before you save

- [ ] Three sections present in order: *What we did* / *Unfinished* / *What's next*?
- [ ] `_Last updated:_` line at the top reflects today's date?
- [ ] "What's next" is **one** phase with a done-when criterion?
- [ ] "Out of scope" sub-section lists later phases by name only?
- [ ] Unfinished items use `- [ ]` checkboxes; completed ones use `- [x]`?
- [ ] No lessons-learned content (those go in `tasks/lessons.md`)?
- [ ] No long narrative — bullets only?

If all seven are yes, save and you're done.
