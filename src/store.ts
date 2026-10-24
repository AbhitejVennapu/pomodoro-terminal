import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export interface SessionRecord {
  tag: string;
  start: string;
  seconds: number;
}

export function defaultLogPath(env: NodeJS.ProcessEnv = process.env): string {
  const dataHome = env.XDG_DATA_HOME ?? join(homedir(), '.local', 'share');
  return join(dataHome, 'pomodoro', 'sessions.jsonl');
}

export function appendSession(path: string, record: SessionRecord): void {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(record)}\n`);
}

export function readSessions(path: string): SessionRecord[] {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as SessionRecord);
}

export function sessionsOn(records: SessionRecord[], day: Date): SessionRecord[] {
  return records.filter((r) => new Date(r.start).toDateString() === day.toDateString());
}

export function secondsByTag(records: SessionRecord[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const r of records) {
    totals[r.tag] = (totals[r.tag] ?? 0) + r.seconds;
  }
  return totals;
}
