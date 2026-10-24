export type Phase = 'work' | 'shortBreak' | 'longBreak';

export interface Settings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsPerLongBreak: number;
}

export const DEFAULT_SETTINGS: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsPerLongBreak: 4,
};

export interface Timer {
  phase: Phase;
  tag: string;
  startedAt: number;
  durationMs: number;
  accumulatedMs: number;
  runningSince: number | null;
  // Completed work sessions since the last long break.
  cycleCount: number;
}

const MINUTE_MS = 60_000;

function phaseDurationMs(phase: Phase, settings: Settings): number {
  switch (phase) {
    case 'work':
      return settings.workMinutes * MINUTE_MS;
    case 'shortBreak':
      return settings.shortBreakMinutes * MINUTE_MS;
    case 'longBreak':
      return settings.longBreakMinutes * MINUTE_MS;
  }
}

function beginPhase(
  phase: Phase,
  tag: string,
  settings: Settings,
  now: number,
  cycleCount: number,
): Timer {
  return {
    phase,
    tag,
    startedAt: now,
    durationMs: phaseDurationMs(phase, settings),
    accumulatedMs: 0,
    runningSince: now,
    cycleCount,
  };
}

export function startTimer(settings: Settings, tag: string, now: number): Timer {
  return beginPhase('work', tag, settings, now, 0);
}

export function elapsedMs(timer: Timer, now: number): number {
  const running = timer.runningSince === null ? 0 : now - timer.runningSince;
  return Math.max(0, Math.min(timer.durationMs, timer.accumulatedMs + running));
}

export function remainingMs(timer: Timer, now: number): number {
  return timer.durationMs - elapsedMs(timer, now);
}

export function isFinished(timer: Timer, now: number): boolean {
  return remainingMs(timer, now) <= 0;
}

export function isPaused(timer: Timer): boolean {
  return timer.runningSince === null;
}

export function togglePause(timer: Timer, now: number): Timer {
  if (timer.runningSince === null) {
    return { ...timer, runningSince: now };
  }
  return {
    ...timer,
    accumulatedMs: timer.accumulatedMs + (now - timer.runningSince),
    runningSince: null,
  };
}

export function resetPhase(timer: Timer, settings: Settings, now: number): Timer {
  return beginPhase(timer.phase, timer.tag, settings, now, timer.cycleCount);
}

export function nextPhase(timer: Timer, settings: Settings, now: number): Timer {
  if (timer.phase !== 'work') {
    return beginPhase('work', timer.tag, settings, now, timer.cycleCount);
  }
  const completed = timer.cycleCount + 1;
  if (completed >= settings.sessionsPerLongBreak) {
    return beginPhase('longBreak', timer.tag, settings, now, 0);
  }
  return beginPhase('shortBreak', timer.tag, settings, now, completed);
}
