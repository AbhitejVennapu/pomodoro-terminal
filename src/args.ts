import type { Settings } from './engine.js';
import { isValidTypeId } from './config.js';
import type { Range } from './stats.js';

export const USAGE = `Usage:
  pomodoro [start] [tag] [options]
  pomodoro stats [--week]
  pomodoro dashboard                      full-screen summary of past sessions
  pomodoro types                          list session types
  pomodoro types add <name> [--label <text>] [--color <color>]

Options:
  -t, --tag <name>     session type to log (default: first type in config)
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
  | { kind: 'start'; tag?: string; overrides: Partial<Settings> }
  | { kind: 'stats'; range: Range }
  | { kind: 'dashboard' }
  | { kind: 'types-list' }
  | { kind: 'types-add'; id: string; label?: string; color?: string };

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

function parseTypes(args: string[]): ParsedArgs {
  if (args.length === 0) return { kind: 'types-list' };
  if (args[0] !== 'add') throw new Error(`Unknown types command: ${args[0]}`);

  const id = args[1];
  if (id === undefined) throw new Error('types add needs a name');
  if (!isValidTypeId(id)) {
    throw new Error(`Type "${id}" must use lowercase letters, digits, or dashes`);
  }

  let label: string | undefined;
  let color: string | undefined;
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--label') {
      label = args[++i];
      if (label === undefined) throw new Error('--label needs a value');
    } else if (arg === '--color') {
      color = args[++i];
      if (color === undefined) throw new Error('--color needs a value');
    } else {
      throw new Error(`Unknown option for types add: ${arg}`);
    }
  }
  return { kind: 'types-add', id, label, color };
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = [...argv];
  if (args[0] === 'stats') return parseStats(args.slice(1));
  if (args[0] === 'types') return parseTypes(args.slice(1));
  if (args[0] === 'dashboard') {
    if (args.length > 1) throw new Error(`Unexpected argument for dashboard: ${args[1]}`);
    return { kind: 'dashboard' };
  }
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

  return { kind: 'start', tag, overrides };
}
