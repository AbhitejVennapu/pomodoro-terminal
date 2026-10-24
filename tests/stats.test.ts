import { describe, expect, it } from 'vitest';
import { formatStats, recordsInRange } from '../src/stats.js';
import type { SessionRecord } from '../src/store.js';

const now = new Date(2026, 9, 24, 15);
const today = new Date(2026, 9, 24, 9).toISOString();
const threeDaysAgo = new Date(2026, 9, 21, 9).toISOString();
const twelveDaysAgo = new Date(2026, 9, 12, 9).toISOString();

const records: SessionRecord[] = [
  { tag: 'work', start: today, seconds: 1500 },
  { tag: 'read', start: today, seconds: 600 },
  { tag: 'work', start: threeDaysAgo, seconds: 3000 },
  { tag: 'work', start: twelveDaysAgo, seconds: 1500 },
];

describe('stats', () => {
  it('limits today to the current local day', () => {
    expect(recordsInRange(records, 'today', now)).toHaveLength(2);
  });

  it('covers the last 7 days including today', () => {
    expect(recordsInRange(records, 'week', now)).toHaveLength(3);
  });

  it('formats totals per tag, largest first', () => {
    expect(formatStats(records, 'today', now, ['work', 'read'])).toBe(
      ['Today: 2 sessions, 35 min', '  work  1 session  25 min', '  read  1 session  10 min'].join('\n'),
    );
  });

  it('marks tags that are no longer configured as unlisted', () => {
    const lines = formatStats(records, 'today', now, ['work']).split('\n');
    expect(lines[2]).toMatch(/^ {2}read \(unlisted\) +1 session {2}10 min$/);
    expect(lines[1]).toMatch(/^ {2}work +1 session {2}25 min$/);
  });

  it('says so when there is nothing to report', () => {
    expect(formatStats([], 'week', now, ['work'])).toBe('Last 7 days: no sessions yet');
  });
});
