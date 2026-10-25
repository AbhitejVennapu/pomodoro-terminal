# Status

Last updated: 2026-10-25. Update this file before opening each PR.

## Merged to `main`

- #1 scaffold: timer engine, JSONL session log, args, Ink UI, tests
- #2 stats command, config file, phase-end bell
- #3 required session types, `types` commands, unlisted tags in stats
- #4 dashboard with 7 and 30 day views
- #5 README and npm publish setup
- #6 CLAUDE.md hand-off notes
- #7 split hand-off notes into `docs/STATUS.md` and `docs/ARCHITECTURE.md`
- #8 rule in CLAUDE.md to update docs before opening a PR
- #9 `docs/ROADMAP.md` for sync, database, and web app options
- #10 30-day dashboard key changed to `m` (terminals send `3` and `0` separately, so `30` never matched)
- #11 7-day dashboard key changed to `w`, to match `m`
- Pluralization fix on the timer screen, committed directly to `main`

## Working

- Focus, short break, and long break cycles, with pause, skip, reset, and quit
- Long break every 4 focus sessions; durations set by flag or config
- `stats [--week]`, and `dashboard` with `w` (7 days) and `m` (30 days)
- Strict session types, with a hint to create or list them when a tag is unknown
- Terminal bell when a phase ends on its own
- Checked by the owner in a real terminal: timer, log, dashboard, and error messages
- 49 tests passing, plus typecheck and build
- `main` is protected: changes go through a PR

## Not done

- **npm publish.** Deferred by the owner. Before publishing, decide the license (see below). The owner must run `npm login` first; they have just created the account. Then publish from `main` and verify `npm install -g pomodoro-terminal`.
- **License decision.** `package.json` and the README say ISC, but no LICENSE file exists. A published version can't be fully removed from npm, so settle this before publishing.
- **CI.** No GitHub Actions workflow yet. Planned: typecheck, test, and build on each PR. Explain each step to the owner, who is learning CI.
- **Long-break counter** resets when the app restarts. Undecided whether to persist it.
- **Dashboard drill-down** by type is deferred.
- **Sync, database, and web app** are discussed but not started. See `docs/ROADMAP.md`.
- **Cleanup.** Merged feature branches still exist on GitHub and locally. Safe to delete.
