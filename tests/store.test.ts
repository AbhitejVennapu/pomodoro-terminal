import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  appendSession,
  readSessions,
  secondsByTag,
  sessionsOn,
  type SessionRecord,
} from '../src/store.js';

let dir: string;
let logPath: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'pomodoro-test-'));
  logPath = join(dir, 'nested', 'sessions.jsonl');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('session store', () => {
  it('returns an empty list when no log exists yet', () => {
    expect(readSessions(logPath)).toEqual([]);
  });

  it('appends and reads back sessions, creating directories as needed', () => {
    const record: SessionRecord = { tag: 'work', start: new Date(2026, 9, 24, 9).toISOString(), seconds: 1500 };
    appendSession(logPath, record);
    appendSession(logPath, { ...record, tag: 'read' });
    expect(readSessions(logPath)).toEqual([record, { ...record, tag: 'read' }]);
  });

  it('filters sessions by local day and totals seconds per tag', () => {
    const today = new Date(2026, 9, 24, 9).toISOString();
    const yesterday = new Date(2026, 9, 23, 9).toISOString();
    const records: SessionRecord[] = [
      { tag: 'work', start: today, seconds: 1500 },
      { tag: 'read', start: today, seconds: 600 },
      { tag: 'work', start: yesterday, seconds: 3000 },
    ];
    const todays = sessionsOn(records, new Date(2026, 9, 24, 18));
    expect(todays).toHaveLength(2);
    expect(secondsByTag(todays)).toEqual({ work: 1500, read: 600 });
  });
});
