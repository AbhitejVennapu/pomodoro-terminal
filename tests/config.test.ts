import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defaultConfigPath, loadConfig } from '../src/config.js';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'pomodoro-config-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('config', () => {
  it('returns no overrides when the config file does not exist', () => {
    expect(loadConfig(join(dir, 'missing.json'))).toEqual({});
  });

  it('loads only the known settings', () => {
    const path = join(dir, 'config.json');
    writeFileSync(path, JSON.stringify({ workMinutes: 50, longBreakMinutes: 30, unknown: 1 }));
    expect(loadConfig(path)).toEqual({ workMinutes: 50, longBreakMinutes: 30 });
  });

  it('rejects non-object files', () => {
    const path = join(dir, 'config.json');
    writeFileSync(path, JSON.stringify([1, 2]));
    expect(() => loadConfig(path)).toThrow('expected a JSON object');
  });

  it('rejects invalid durations', () => {
    const path = join(dir, 'config.json');
    writeFileSync(path, JSON.stringify({ shortBreakMinutes: -5 }));
    expect(() => loadConfig(path)).toThrow('"shortBreakMinutes" must be a positive number');
  });

  it('uses XDG_CONFIG_HOME when set', () => {
    mkdirSync(join(dir, 'pomodoro'));
    expect(defaultConfigPath({ XDG_CONFIG_HOME: dir })).toBe(join(dir, 'pomodoro', 'config.json'));
  });
});
