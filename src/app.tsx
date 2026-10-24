import React, { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import {
  elapsedMs,
  isFinished,
  isPaused,
  nextPhase,
  remainingMs,
  resetPhase,
  startTimer,
  togglePause,
  type Phase,
  type Settings,
  type Timer,
} from './engine.js';
import { appendSession, readSessions, secondsByTag, sessionsOn, type SessionRecord } from './store.js';

export interface AppProps {
  settings: Settings;
  tag: string;
  logPath: string;
}

const PHASE_LABELS: Record<Phase, string> = {
  work: 'Focus',
  shortBreak: 'Short break',
  longBreak: 'Long break',
};

function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60).toString().padStart(2, '0');
  const seconds = (total % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function App({ settings, tag, logPath }: AppProps) {
  const { exit } = useApp();
  const [timer, setTimer] = useState<Timer>(() => startTimer(settings, tag, Date.now()));
  const [now, setNow] = useState(() => Date.now());
  const [today, setToday] = useState<SessionRecord[]>(() =>
    sessionsOn(readSessions(logPath), new Date()),
  );

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  function logWork(t: Timer, at: number) {
    if (t.phase !== 'work') return;
    const seconds = Math.round(elapsedMs(t, at) / 1000);
    if (seconds === 0) return;
    const record = { tag: t.tag, start: new Date(t.startedAt).toISOString(), seconds };
    appendSession(logPath, record);
    setToday((prev) => [...prev, record]);
  }

  useEffect(() => {
    if (!isFinished(timer, now)) return;
    logWork(timer, now);
    setTimer(nextPhase(timer, settings, Date.now()));
  }, [now]);

  useInput((input) => {
    const at = Date.now();
    if (input === ' ') {
      setTimer((t) => togglePause(t, at));
    } else if (input === 's') {
      logWork(timer, at);
      setTimer(nextPhase(timer, settings, at));
    } else if (input === 'r') {
      setTimer((t) => resetPhase(t, settings, at));
    } else if (input === 'q') {
      logWork(timer, at);
      exit();
    }
  });

  const todaySeconds = secondsByTag(today);
  const totalSeconds = Object.values(todaySeconds).reduce((sum, s) => sum + s, 0);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>
        {PHASE_LABELS[timer.phase]}
        {timer.phase === 'work' ? ` · ${timer.tag}` : ''}
        {isPaused(timer) ? ' (paused)' : ''}
      </Text>
      <Text bold color={timer.phase === 'work' ? 'red' : 'green'}>
        {formatClock(remainingMs(timer, now))}
      </Text>
      <Text dimColor>space pause · s skip · r reset · q quit</Text>
      <Box marginTop={1}>
        <Text>
          Today: {today.length} sessions · {Math.round(totalSeconds / 60)} min
        </Text>
      </Box>
    </Box>
  );
}
