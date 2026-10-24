import { secondsByTag, sessionsOn, type SessionRecord } from './store.js';

export type Range = 'today' | 'week';

export function recordsInRange(records: SessionRecord[], range: Range, now: Date): SessionRecord[] {
  if (range === 'today') return sessionsOn(records, now);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  return records.filter((r) => new Date(r.start) >= start);
}

function plural(count: number): string {
  return count === 1 ? 'session' : 'sessions';
}

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

export function formatStats(records: SessionRecord[], range: Range, now: Date): string {
  const label = range === 'today' ? 'Today' : 'Last 7 days';
  const selected = recordsInRange(records, range, now);
  if (selected.length === 0) return `${label}: no sessions yet`;

  const totalSeconds = selected.reduce((sum, r) => sum + r.seconds, 0);
  const lines = [`${label}: ${selected.length} ${plural(selected.length)}, ${formatMinutes(totalSeconds)}`];

  const totals = Object.entries(secondsByTag(selected)).sort((a, b) => b[1] - a[1]);
  const width = Math.max(...totals.map(([tag]) => tag.length));
  for (const [tag, seconds] of totals) {
    const count = selected.filter((r) => r.tag === tag).length;
    lines.push(`  ${tag.padEnd(width)}  ${count} ${plural(count)}  ${formatMinutes(seconds)}`);
  }

  return lines.join('\n');
}
