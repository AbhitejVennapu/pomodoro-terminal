# Status

Last updated: 2026-10-25. Update this file after each merged change.

## Merged to `main`

- #1 scaffold: timer engine, JSONL session log, args, Ink UI, tests
- #2 stats command, config file, phase-end bell
- #3 required session types, `types` commands, unlisted tags in stats
- #4 dashboard with 7 and 30 day views
- #5 README and npm publish setup
- #6 CLAUDE.md hand-off notes
- Pluralization fix on the timer screen, committed directly to `main`

## Working

- Focus, short break, and long break cycles, with pause, skip, reset, and quit
- Long break every 4 focus sessions; durations set by flag or config
- `stats [--week]` and `dashboard` (7 and 30 day views)
- Strict session types, with a hint to create or list them when a tag is unknown
- Terminal bell when a phase ends on its own
- 49 tests passing, plus typecheck and build

## Not done

- **npm publish.** Blocked until the owner creates an npm account and runs `npm login`. Then publish from `main` and verify `npm install -g pomodoro-terminal`.
- **LICENSE file.** `package.json` and the README say ISC, but no LICENSE file exists. Confirm the license first.
- **CI.** No GitHub Actions workflow yet. Planned: typecheck, test, and build on each PR.
- **Real-terminal check.** The bell, the colors, and the dashboard layout have only been checked in a simulated terminal.
- **Long-break counter** resets when the app restarts. Undecided whether to persist it.
- **Dashboard drill-down** by type is deferred.
- **Cleanup.** Merged feature branches still exist on GitHub and locally. Safe to delete.
