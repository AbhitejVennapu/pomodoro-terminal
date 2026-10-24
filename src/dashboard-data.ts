import type { SessionType } from './config.js';
import { sessionsOn, type SessionRecord } from './store.js';

export interface Segment {
  tag: string;
  seconds: number;
}

export interface DayBar {
  label: string;
  segments: Segment[];
  totalSeconds: number;
}

export interface TypeTotal {
  tag: string;
  count: number;
  seconds: number;
}

export interface Dashboard {
  todaySeconds: number;
  todaySessions: number;
  streak: number;
  days: DayBar[];
  totals: TypeTotal[];
}

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function daysBefore(date: Date, n: number): Date {
  const earlier = new Date(date);
  earlier.setDate(earlier.getDate() - n);
  return earlier;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatLabel(day: Date): string {
  return `${pad(day.getMonth() + 1)}/${pad(day.getDate())}`;
}

function tagOrder(records: SessionRecord[], types: Record<string, SessionType>): string[] {
  const configured = Object.keys(types);
  const unlisted = [...new Set(records.map((r) => r.tag))]
    .filter((tag) => !configured.includes(tag))
    .sort();
  return [...configured, ...unlisted];
}

function secondsFor(records: SessionRecord[], tag: string): number {
  return records.filter((r) => r.tag === tag).reduce((sum, r) => sum + r.seconds, 0);
}

export function buildDashboard(
  records: SessionRecord[],
  types: Record<string, SessionType>,
  days: number,
  now: Date,
): Dashboard {
  const today = startOfDay(now);
  const tags = tagOrder(records, types);

  const bars: DayBar[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = daysBefore(today, i);
    const dayRecords = sessionsOn(records, day);
    const segments = tags
      .map((tag) => ({ tag, seconds: secondsFor(dayRecords, tag) }))
      .filter((s) => s.seconds > 0);
    bars.push({
      label: formatLabel(day),
      segments,
      totalSeconds: segments.reduce((sum, s) => sum + s.seconds, 0),
    });
  }

  const rangeStart = daysBefore(today, days - 1);
  const inRange = records.filter((r) => new Date(r.start) >= rangeStart);
  const totals = tags
    .map((tag) => {
      const tagRecords = inRange.filter((r) => r.tag === tag);
      return {
        tag,
        count: tagRecords.length,
        seconds: tagRecords.reduce((sum, r) => sum + r.seconds, 0),
      };
    })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.seconds - a.seconds);

  const todayRecords = sessionsOn(records, now);
  let streak = 0;
  while (sessionsOn(records, daysBefore(today, streak)).length > 0) streak++;

  return {
    todaySeconds: todayRecords.reduce((sum, r) => sum + r.seconds, 0),
    todaySessions: todayRecords.length,
    streak,
    days: bars,
    totals,
  };
}
