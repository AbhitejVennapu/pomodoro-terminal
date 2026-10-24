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

export function formatStats(
  records: SessionRecord[],
  range: Range,
  now: Date,
  knownIds: string[],
): string {
  const label = range === 'today' ? 'Today' : 'Last 7 days';
  const selected = recordsInRange(records, range, now);
  if (selected.length === 0) return `${label}: no sessions yet`;

  const totalSeconds = selected.reduce((sum, r) => sum + r.seconds, 0);
  const lines = [`${label}: ${selected.length} ${plural(selected.length)}, ${formatMinutes(totalSeconds)}`];

  const known = new Set(knownIds);
  const totals = Object.entries(secondsByTag(selected))
    .sort((a, b) => b[1] - a[1])
    .map(([tag, seconds]) => ({
      name: known.has(tag) ? tag : `${tag} (unlisted)`,
      count: selected.filter((r) => r.tag === tag).length,
      seconds,
    }));

  const width = Math.max(...totals.map((t) => t.name.length));
  for (const { name, count, seconds } of totals) {
    lines.push(`  ${name.padEnd(width)}  ${count} ${plural(count)}  ${formatMinutes(seconds)}`);
  }

  return lines.join('\n');
}
