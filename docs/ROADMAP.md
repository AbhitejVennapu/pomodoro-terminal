# Roadmap and open decisions

Captured 2026-10-25 so the next discussion can start from here. Nothing in this file is built yet.

## Current product

The CLI is the product. Sessions live in a local JSONL file, the terminal timer and dashboard read it, and no network is involved. This already covers one person on one machine.

## Open question: do we need sync, a database, or a web app?

Decision so far: the CLI is complete. Cloud sync, a database, and a web app are for **learning**, not for a product need. They're worth building only if one of these becomes true:

- You use **more than one device** and want the same history on each.
- You want **phone access** to stats or the timer while away from your computer.
- You want to **share** the app with other people.

If none of these apply, stop at the CLI.

## Options considered

1. **Sync via a folder you already use** (iCloud, Dropbox, Google Drive). Point `XDG_DATA_HOME` at the shared folder on each machine. No code changes. Risk: simultaneous writes can create conflicting copies.
2. **Sync via a private git repo.** Pull before and push after each session. Works well for an append-only file, but is manual unless wrapped in a `pomodoro sync` command.
3. **Hosted database** (for example Supabase or Firebase). Real sync and conflict handling. Needs accounts, hosting, and a decision on where data lives.
4. **Local web page** that reads the same JSONL file, served from your own machine. Teaches the web side with no database, hosting, or login. Phone access only works on the same network.

## Build order, if we go ahead

Order is set by dependencies: sync needs a shared store, the UI needs data, and auth must exist before anything is reachable online.

1. Backend and database: a small API that saves and reads sessions, protected by a simple secret key from day one.
2. Terminal sync: the terminal posts each finished session to the API and keeps the local file as an offline backup.
3. Web UI: a responsive page that works on a phone, reading from the API. Reuse `src/dashboard-data.ts`, which is pure logic.
4. Hosting: deploy the API and UI together, so one URL works on the phone.
5. Full authentication and accounts, only if other people will use it.

## Constraints to keep in mind

- The repo is **public**. Database keys, passwords, and personal session data must never be committed. Use environment variables and a private database.
- Keep the session record shape stable: `{tag, start, seconds}`. Changing it affects the log, stats, the dashboard, and any future sync.
- `src/store.ts` is the only module that touches the file. Keep it that way, so swapping in a database changes one module.

## Questions to answer before building

- Do we need more than one device or phone access, or is this only for learning?
- For learning, which is better: a local web page (option 4), or a hosted backend (option 3)?
- If hosted, which database and hosting provider? Pick one that has a free tier.
- Will anyone besides you use it? If yes, accounts become necessary.
