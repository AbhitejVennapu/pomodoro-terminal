import { describe, expect, it } from 'vitest';
import { buildDashboard } from '../src/dashboard-data.js';
import type { SessionRecord } from '../src/store.js';

const now = new Date(2026, 9, 24, 15);
const at = (day: number, hour = 9) => new Date(2026, 9, day, hour).toISOString();

const records: SessionRecord[] = [
  { tag: 'work', start: at(24), seconds: 1500 },
  { tag: 'read', start: at(24, 10), seconds: 600 },
  { tag: 'work', start: at(23), seconds: 1500 },
  { tag: 'work', start: at(22), seconds: 1500 },
  { tag: 'research', start: at(20), seconds: 900 },
];
const types = { work: { label: 'Work' }, read: { label: 'Reading' } };

describe('buildDashboard', () => {
  it('builds one bar per day for the selected range, ending today', () => {
    const data = buildDashboard(records, types, 7, now);
    expect(data.days).toHaveLength(7);
    expect(data.days[6].label).toBe('10/24');
    expect(data.days[0].label).toBe('10/18');
  });

  it('stacks each day by type in configured order, then unlisted tags', () => {
    const today = buildDashboard(records, types, 7, now).days[6];
    expect(today.segments).toEqual([
      { tag: 'work', seconds: 1500 },
      { tag: 'read', seconds: 600 },
    ]);
    expect(today.totalSeconds).toBe(2100);
  });

  it('counts today and the streak of consecutive days with sessions', () => {
    const data = buildDashboard(records, types, 7, now);
    expect(data.todaySessions).toBe(2);
    expect(data.todaySeconds).toBe(2100);
    expect(data.streak).toBe(3);
  });

  it('totals the range per type, largest first, including unlisted tags', () => {
    const data = buildDashboard(records, types, 7, now);
    expect(data.totals).toEqual([
      { tag: 'work', count: 3, seconds: 4500 },
      { tag: 'research', count: 1, seconds: 900 },
      { tag: 'read', count: 1, seconds: 600 },
    ]);
  });

  it('covers 30 days and includes older sessions in totals', () => {
    const data = buildDashboard(records, types, 30, now);
    expect(data.days).toHaveLength(30);
    expect(data.totals.find((t) => t.tag === 'research')).toEqual({
      tag: 'research',
      count: 1,
      seconds: 900,
    });
  });

  it('has a zero streak when today has no sessions', () => {
    const data = buildDashboard(records, types, 7, new Date(2026, 9, 25, 9));
    expect(data.streak).toBe(0);
    expect(data.todaySessions).toBe(0);
  });
});
