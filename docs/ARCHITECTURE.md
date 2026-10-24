# Architecture

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

## Design decisions

- **Engine is pure.** The UI only renders engine state. Elapsed time is computed from `runningSince` and `accumulatedMs`, which avoids interval drift.
- **Log holds work sessions only**, one JSON record per line: `{tag, start (ISO), seconds}`. A session is logged when it finishes naturally, when it is skipped, or when the app quits during it. Skipping or quitting a break logs nothing.
- **Strict tags.** A tag must exist in the config's `types`. Type IDs are lowercase letters, digits, and dashes. With no tag, `start` uses the first configured type.
- **Unlisted tags stay visible.** Tags in old history that are no longer configured show as `(unlisted)` in stats and the dashboard.
- **Config location** is `$XDG_CONFIG_HOME/pomodoro/config.json` (default `~/.config`). Data location is `$XDG_DATA_HOME/pomodoro/` (default `~/.local/share`). Command-line flags override config values.
- **Colors** come from the config. The dashboard falls back to a fixed palette, chosen by a hash of the tag name, when a type has no color.
- **Sessions are not sent anywhere.** Everything stays local.
