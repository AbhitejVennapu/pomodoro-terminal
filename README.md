# pomodoro-terminal

A Pomodoro timer for your terminal. Run focus sessions tagged by what you're doing (work, reading, research), then look at where your time went.

## Requirements

- Node.js 20 or newer

## Install

From npm:

```bash
npm install -g pomodoro-terminal
```

From source:

```bash
git clone https://github.com/AbhitejVennapu/pomodoro-terminal
cd pomodoro-terminal
npm install
npm run build
npm link
```

## Quick start

```bash
pomodoro types add work --label Work --color red
pomodoro types add read --label Reading --color blue
pomodoro start work
```

## Commands

| Command | What it does |
| --- | --- |
| `pomodoro start <tag>` | Run a timer for a session type. `pomodoro <tag>` works too. |
| `pomodoro types` | List session types. |
| `pomodoro types add <name> [--label <text>] [--color <color>]` | Create a session type. |
| `pomodoro stats [--week]` | Print minutes and sessions per type for today, or the last 7 days. |
| `pomodoro dashboard` | Open a full-screen view of the last 7 or 30 days. |

Session types must use lowercase letters, digits, or dashes. Starting a session with a tag that doesn't exist fails and tells you how to create it.

## Timer options

Each run can override the durations:

```bash
pomodoro start work --work 50 --short 10 --long 30
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `--work` | 25 | Focus length in minutes |
| `--short` | 5 | Short break length in minutes |
| `--long` | 15 | Long break length in minutes |

A long break starts after every 4 focus sessions.

## Keys

| Key | Action |
| --- | --- |
| `space` | Pause or resume |
| `s` | Skip the current phase |
| `r` | Restart the current phase |
| `q` | Quit |

A focus session is saved when it finishes, when you skip it, or when you quit during it. The timer rings the terminal bell when a phase ends on its own.

## Dashboard keys

| Key | Action |
| --- | --- |
| `7` | Show the last 7 days |
| `m` | Show the last 30 days (month) |
| `q` | Quit |

## Configuration

Settings live in `~/.config/pomodoro/config.json` (or `$XDG_CONFIG_HOME/pomodoro/config.json`). Every key is optional:

```json
{
  "workMinutes": 25,
  "shortBreakMinutes": 5,
  "longBreakMinutes": 15,
  "sessionsPerLongBreak": 4,
  "types": {
    "work": { "label": "Work", "color": "red" },
    "read": { "label": "Reading", "color": "blue" },
    "research": { "label": "Research", "color": "magenta" }
  }
}
```

Colors are terminal color names such as `red`, `green`, `blue`, `magenta`, `cyan`, and `yellow`. Command-line flags override the config file.

## Where data is stored

- Sessions: `~/.local/share/pomodoro/sessions.jsonl` (or `$XDG_DATA_HOME/pomodoro/`), one JSON object per line.
- Config: `~/.config/pomodoro/config.json`.

Nothing is sent over the network.

## Development

```bash
npm install
npm run dev -- work --work 1   # run from source
npm test                       # run tests
npm run typecheck              # type check
npm run build                  # compile to dist/
```

## License

ISC
