# Pomodoro terminal: project notes

Hand-off notes for AI assistants and for the owner when returning to this project. Keep this file current when work lands.

## What it is

A terminal Pomodoro timer in TypeScript with Ink (React for the terminal). It logs focus sessions tagged by type (work, read, research) and shows where time went through `stats` and a full-screen `dashboard`.

- Repo: https://github.com/AbhitejVennapu/pomodoro-terminal (public)
- Owner: Abhitej Vennapu. This is a learning project. The owner is new to the git/PR workflow and npm, so explain steps as you go.

## Status (2026-10-25)

Merged to `main`: scaffold (#1), stats and config (#2), session types (#3), dashboard (#4), README and publish setup (#5), plus a direct pluralization fix on `main`.

Working:
- Focus, short break, and long break cycles, with pause, skip, reset, and quit.
- Long break every 4 focus sessions. Durations configurable by flag or config.
- Session log, `stats [--week]`, and `dashboard` with 7 and 30 day views.
- Strict session types: unknown tags are rejected with the commands to create or list them.
- Terminal bell when a phase ends on its own.
- 49 tests passing, plus typecheck and build.

Not done yet:
- **npm publish.** Blocked until the owner creates an npm account and runs `npm login`. Then publish from `main` and verify `npm install -g pomodoro-terminal`.
- **LICENSE file.** `package.json` and the README say ISC, but there is no LICENSE file. Confirm the license before adding it.
- **CI.** No GitHub Actions workflow yet. Planned: typecheck, test, and build on each PR.
- **Real-terminal check.** The bell, the colors, and the dashboard layout have only been checked in a simulated terminal.
- **Long-break counter** resets when the app restarts. Not yet decided whether to persist it.
- **Dashboard drill-down** by type was deliberately deferred.
- Stale merged feature branches still exist on GitHub and locally. Safe to delete.

## Layout

- `src/engine.ts`: pure timer state machine. Takes `now` as input, so tests control time. No I/O.
- `src/store.ts`: session log in JSONL, plus helpers for day and tag totals.
- `src/config.ts`: config loading, adding session types, tag resolution, and type listing.
- `src/args.ts`: command-line parsing and the usage text.
- `src/stats.ts`: text output for `pomodoro stats`.
- `src/dashboard-data.ts`: pure data for the dashboard (daily bars, totals, streak).
- `src/dashboard.tsx`: Ink view for the dashboard. Renders only.
- `src/app.tsx`: Ink timer screen. Renders engine state and writes the log.
- `src/cli.tsx`: entry point. Dispatches each command and exits.
- `tests/`: vitest tests for each module above.

## Commands

- `npm test`: run tests (vitest).
- `npm run typecheck`: type check (`tsc --noEmit`).
- `npm run build`: compile to `dist/` (uses `tsconfig.build.json`).
- `npm run dev -- <args>`: run from source with tsx, e.g. `npm run dev -- dashboard`.

## Design decisions

- **Engine is pure.** The UI only renders engine state. Elapsed time is computed from `runningSince` and `accumulatedMs`, which avoids interval drift.
- **Log holds work sessions only**, one JSON record per line: `{tag, start (ISO), seconds}`. A session is logged when it finishes naturally, when it is skipped, or when the app quits during it. Skipping or quitting a break logs nothing.
- **Strict tags.** A tag must exist in the config's `types`. Type IDs are lowercase letters, digits, and dashes. With no tag, `start` uses the first configured type.
- **Unlisted tags stay visible.** Tags in old history that are no longer configured show as `(unlisted)` in stats and the dashboard.
- **Config location** is `$XDG_CONFIG_HOME/pomodoro/config.json` (default `~/.config`). Data location is `$XDG_DATA_HOME/pomodoro/` (default `~/.local/share`). Command-line flags override config values.
- **Colors** come from the config. The dashboard falls back to a fixed palette, chosen by a hash of the tag name, when a type has no color.
- **Sessions are not sent anywhere.** Everything stays local.

## Workflow

- `main` is protected. Changes go through a pull request. No approval is required, so the owner merges their own PRs.
- Branch names: `feat/...`, `chore/...`, `docs/...`, `fix/...`.
- Before opening a PR: `npm run typecheck`, `npm test`, and `npm run build` should all pass.
- Commits use a short conventional prefix (`feat:`, `fix:`, `docs:`, `chore:`). AI-authored commits and PRs carry the attribution lines that the session setup requires.
- Only commit or push when the owner asks. For the PR, use `--base main` (or the base branch when stacked).

## Gotchas

- **Ink needs a real TTY.** It fails in plain non-interactive shells with a raw-mode error. For a smoke test, run the built CLI under a pseudo-terminal (for example, Python's `pty` module). Point `HOME` at a temp directory so the real session log and config are not touched.
- **Test with a temp config.** Running `pomodoro types add` or `start` against the real home directory changes the owner's real config and log. Do that only with the owner's go-ahead.
- **TypeScript 7 needs `"types": ["node"]`** in `tsconfig.json`. Without it, Node globals such as `process` and `node:fs` don't resolve.
- **ESM only.** `package.json` has `"type": "module"`, and imports use `.js` extensions.
- The `.claude/` folder holds local settings and is not tracked.
