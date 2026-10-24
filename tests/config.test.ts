import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addType,
  defaultConfigPath,
  formatTypes,
  loadConfig,
  resolveTag,
} from '../src/config.js';

let dir: string;
let path: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'pomodoro-config-'));
  path = join(dir, 'config.json');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('loadConfig', () => {
  it('returns empty settings and types when the file does not exist', () => {
    expect(loadConfig(path)).toEqual({ settings: {}, types: {} });
  });

  it('loads known settings and session types, ignoring unknown keys', () => {
    writeFileSync(
      path,
      JSON.stringify({
        workMinutes: 50,
        unknown: 1,
        types: { work: { label: 'Work', color: 'red' }, read: {} },
      }),
    );
    expect(loadConfig(path)).toEqual({
      settings: { workMinutes: 50 },
      types: { work: { label: 'Work', color: 'red' }, read: {} },
    });
  });

  it('rejects non-object files', () => {
    writeFileSync(path, JSON.stringify([1, 2]));
    expect(() => loadConfig(path)).toThrow('expected a JSON object');
  });

  it('rejects invalid durations', () => {
    writeFileSync(path, JSON.stringify({ shortBreakMinutes: -5 }));
    expect(() => loadConfig(path)).toThrow('"shortBreakMinutes" must be a positive number');
  });

  it('rejects invalid type ids', () => {
    writeFileSync(path, JSON.stringify({ types: { Deep_Work: {} } }));
    expect(() => loadConfig(path)).toThrow('type "Deep_Work" must use lowercase');
  });

  it('uses XDG_CONFIG_HOME when set', () => {
    mkdirSync(join(dir, 'pomodoro'));
    expect(defaultConfigPath({ XDG_CONFIG_HOME: dir })).toBe(join(dir, 'pomodoro', 'config.json'));
  });
});

describe('addType', () => {
  it('creates the file when missing and writes the new type', () => {
    addType(path, 'research', { label: 'Research', color: 'magenta' });
    expect(loadConfig(path).types).toEqual({ research: { label: 'Research', color: 'magenta' } });
  });

  it('keeps existing settings and types', () => {
    writeFileSync(path, JSON.stringify({ workMinutes: 50, types: { work: {} } }));
    addType(path, 'read', {});
    const data = JSON.parse(readFileSync(path, 'utf8'));
    expect(data).toEqual({ workMinutes: 50, types: { work: {}, read: {} } });
  });

  it('refuses to overwrite an existing type', () => {
    writeFileSync(path, JSON.stringify({ types: { work: { label: 'Work' } } }));
    expect(() => addType(path, 'work', {})).toThrow('Type "work" already exists');
  });
});

describe('resolveTag', () => {
  const types = { work: {}, read: {} };

  it('uses the first configured type when no tag is given', () => {
    expect(resolveTag(types)).toBe('work');
  });

  it('returns a known tag', () => {
    expect(resolveTag(types, 'read')).toBe('read');
  });

  it('explains how to create or list types for an unknown tag', () => {
    expect(() => resolveTag(types, 'sketch')).toThrow(
      'Tag "sketch" doesn\'t exist.\n  Create it:    pomodoro types add sketch\n  See existing: pomodoro types',
    );
  });

  it('asks for a type when none are configured', () => {
    expect(() => resolveTag({})).toThrow('No session types yet');
  });
});

describe('formatTypes', () => {
  it('lists types with labels and colors', () => {
    expect(formatTypes({ work: { label: 'Work', color: 'red' }, read: {} })).toBe(
      '  work  Work  [red]\n  read  read',
    );
  });

  it('shows a hint when there are none', () => {
    expect(formatTypes({})).toBe('No session types yet. Create one with: pomodoro types add <name>');
  });
});
