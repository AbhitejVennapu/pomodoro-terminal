import type { Settings } from './engine.js';
import type { Range } from './stats.js';

export const USAGE = `Usage:
  pomodoro [start] [tag] [options]
  pomodoro stats [--week]

Options:
  -t, --tag <name>     tag for the session (default: untagged)
  --work <minutes>     focus length (default: 25)
  --short <minutes>    short break length (default: 5)
  --long <minutes>     long break length (default: 15)
  --week               with stats: last 7 days instead of today
  -h, --help           show this help

Keys:
  space pause/resume · s skip · r reset phase · q quit

Config: ~/.config/pomodoro/config.json (flags override it)`;

export type ParsedArgs =
  | { kind: 'help' }
  | { kind: 'start'; tag: string; overrides: Partial<Settings> }
  | { kind: 'stats'; range: Range };

const DEFAULT_TAG = 'untagged';

function parseMinutes(flag: string, value: string | undefined): number {
  const minutes = Number(value);
  if (value === undefined || !Number.isFinite(minutes) || minutes <= 0) {
    throw new Error(`${flag} needs a positive number of minutes`);
  }
  return minutes;
}

function parseStats(args: string[]): ParsedArgs {
  let range: Range = 'today';
  for (const arg of args) {
    if (arg === '--week') range = 'week';
    else if (arg === '-h' || arg === '--help') return { kind: 'help' };
    else throw new Error(`Unknown option for stats: ${arg}`);
  }
  return { kind: 'stats', range };
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = [...argv];
  if (args[0] === 'stats') return parseStats(args.slice(1));
  if (args[0] === 'start') args.shift();

  let tag: string | undefined;
  const overrides: Partial<Settings> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        return { kind: 'help' };
      case '-t':
      case '--tag':
        tag = args[++i];
        if (!tag) throw new Error(`${arg} needs a name`);
        break;
      case '--work':
        overrides.workMinutes = parseMinutes(arg, args[++i]);
        break;
      case '--short':
        overrides.shortBreakMinutes = parseMinutes(arg, args[++i]);
        break;
      case '--long':
        overrides.longBreakMinutes = parseMinutes(arg, args[++i]);
        break;
      default:
        if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
        if (tag !== undefined) throw new Error(`Unexpected argument: ${arg}`);
        tag = arg;
    }
  }

  return { kind: 'start', tag: tag ?? DEFAULT_TAG, overrides };
}
