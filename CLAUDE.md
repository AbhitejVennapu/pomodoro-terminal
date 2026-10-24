# Pomodoro terminal: working notes

A terminal Pomodoro timer in TypeScript with Ink. Public repo: https://github.com/AbhitejVennapu/pomodoro-terminal. The owner, Abhitej Vennapu, is learning the git/PR workflow and npm, so explain steps as you go.

Read these when relevant:
- `docs/STATUS.md`: what is merged, what works, and what is still open. Update it after each merged change.
- `docs/ARCHITECTURE.md`: file layout and design decisions.

## Commands

- `npm test`: run tests (vitest)
- `npm run typecheck`: type check
- `npm run build`: compile to `dist/`
- `npm run dev -- <args>`: run from source, e.g. `npm run dev -- dashboard`

## Workflow

- `main` is protected. Changes go through a pull request. No approval is required, so the owner merges their own PRs.
- Branch names: `feat/...`, `chore/...`, `docs/...`, `fix/...`.
- Before opening a PR, `npm run typecheck`, `npm test`, and `npm run build` must all pass.
- Commits use a short conventional prefix (`feat:`, `fix:`, `docs:`, `chore:`).
- Only commit or push when the owner asks. Open PRs with `--base main`, or the base branch when stacked.

## Gotchas

- **Ink needs a real TTY.** It fails in plain non-interactive shells with a raw-mode error. For a smoke test, run the built CLI under a pseudo-terminal (for example, Python's `pty` module) with `HOME` set to a temp directory, so the real session log and config are untouched.
- **Don't touch real data.** Running `pomodoro types add` or `start` against the real home directory changes the owner's config and log. Do that only with the owner's go-ahead.
- **TypeScript 7 needs `"types": ["node"]`** in `tsconfig.json`. Without it, Node globals such as `process` and `node:fs` don't resolve.
- **ESM only.** `package.json` has `"type": "module"`, and imports use `.js` extensions.
- The `.claude/` folder holds local settings and is not tracked.
