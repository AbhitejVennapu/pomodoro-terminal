import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import type { SessionType } from './config.js';
import { buildDashboard, type DayBar } from './dashboard-data.js';
import type { SessionRecord } from './store.js';

const PALETTE = ['red', 'green', 'blue', 'magenta', 'cyan', 'yellow'];
const BAR_WIDTH = 30;

export interface DashboardProps {
  records: SessionRecord[];
  types: Record<string, SessionType>;
}

function colorFor(tag: string, types: Record<string, SessionType>): string {
  const configured = types[tag]?.color;
  if (configured) return configured;
  const hash = [...tag].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function labelFor(tag: string, types: Record<string, SessionType>): string {
  return types[tag]?.label ?? tag;
}

function minutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

function plural(count: number): string {
  return count === 1 ? 'session' : 'sessions';
}

function Bar({ day, max, types }: { day: DayBar; max: number; types: Record<string, SessionType> }) {
  return (
    <Box>
      <Text>{day.label}  </Text>
      {day.segments.map((segment) => (
        <Text key={segment.tag} color={colorFor(segment.tag, types)}>
          {'█'.repeat(Math.max(1, Math.round((segment.seconds / max) * BAR_WIDTH)))}
        </Text>
      ))}
      <Text dimColor>{day.totalSeconds > 0 ? `  ${minutes(day.totalSeconds)}` : ''}</Text>
    </Box>
  );
}

export function Dashboard({ records, types }: DashboardProps) {
  const { exit } = useApp();
  const [days, setDays] = useState<7 | 30>(7);

  useInput((input) => {
    if (input === '7') setDays(7);
    else if (input === '30') setDays(30);
    else if (input === 'q') exit();
  });

  const data = buildDashboard(records, types, days, new Date());
  const max = Math.max(...data.days.map((d) => d.totalSeconds), 1);
  const rangeHasSessions = data.totals.length > 0;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Dashboard · last {days} days</Text>
      <Text dimColor>7 week · 30 month · q quit</Text>

      <Box marginTop={1} flexDirection="column">
        <Text>
          Today: {data.todaySessions} {plural(data.todaySessions)} · {minutes(data.todaySeconds)}
          {'   '}Streak: {data.streak} {data.streak === 1 ? 'day' : 'days'}
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {data.days.map((day) => (
          <Bar key={day.label} day={day} max={max} types={types} />
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        {rangeHasSessions ? (
          data.totals.map((t) => (
            <Text key={t.tag}>
              <Text color={colorFor(t.tag, types)}>■ </Text>
              {labelFor(t.tag, types).padEnd(12)} {t.count} {plural(t.count)} · {minutes(t.seconds)}
            </Text>
          ))
        ) : (
          <Text dimColor>No sessions in this range. Start one with: pomodoro start &lt;tag&gt;</Text>
        )}
      </Box>
    </Box>
  );
}
