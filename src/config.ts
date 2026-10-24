import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { DEFAULT_SETTINGS, type Settings } from './engine.js';

export interface SessionType {
  label?: string;
  color?: string;
}

export interface Config {
  settings: Partial<Settings>;
  types: Record<string, SessionType>;
}

const TYPE_ID = /^[a-z0-9][a-z0-9-]*$/;

export function isValidTypeId(id: string): boolean {
  return TYPE_ID.test(id);
}

export function defaultConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  const configHome = env.XDG_CONFIG_HOME ?? join(homedir(), '.config');
  return join(configHome, 'pomodoro', 'config.json');
}

function readRaw(path: string): Record<string, unknown> {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }

  const data: unknown = JSON.parse(text);
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error(`${path}: expected a JSON object`);
  }
  return data as Record<string, unknown>;
}

export function loadConfig(path: string): Config {
  const data = readRaw(path);

  const settings: Partial<Settings> = {};
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
    const value = data[key];
    if (value === undefined) continue;
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error(`${path}: "${key}" must be a positive number`);
    }
    settings[key] = value;
  }

  const types: Record<string, SessionType> = {};
  const rawTypes = data.types ?? {};
  if (typeof rawTypes !== 'object' || rawTypes === null || Array.isArray(rawTypes)) {
    throw new Error(`${path}: "types" must be an object`);
  }
  for (const [id, value] of Object.entries(rawTypes)) {
    if (!isValidTypeId(id)) {
      throw new Error(`${path}: type "${id}" must use lowercase letters, digits, or dashes`);
    }
    if (typeof value !== 'object' || value === null) {
      throw new Error(`${path}: type "${id}" must be an object`);
    }
    types[id] = value as SessionType;
  }

  return { settings, types };
}

export function addType(path: string, id: string, type: SessionType): void {
  const data = readRaw(path);
  const types = (data.types ?? {}) as Record<string, SessionType>;
  if (Object.hasOwn(types, id)) throw new Error(`Type "${id}" already exists`);

  types[id] = type;
  data.types = types;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

export function resolveTag(types: Record<string, SessionType>, tag?: string): string {
  if (tag === undefined) {
    const [first] = Object.keys(types);
    if (first === undefined) {
      throw new Error('No session types yet. Create one with: pomodoro types add <name>');
    }
    return first;
  }
  if (!Object.hasOwn(types, tag)) {
    throw new Error(
      `Tag "${tag}" doesn't exist.\n` +
        `  Create it:    pomodoro types add ${tag}\n` +
        '  See existing: pomodoro types',
    );
  }
  return tag;
}

export function formatTypes(types: Record<string, SessionType>): string {
  const ids = Object.keys(types);
  if (ids.length === 0) return 'No session types yet. Create one with: pomodoro types add <name>';

  const width = Math.max(...ids.map((id) => id.length));
  return ids
    .map((id) => {
      const { label, color } = types[id];
      return `  ${id.padEnd(width)}  ${label ?? id}${color ? `  [${color}]` : ''}`;
    })
    .join('\n');
}
