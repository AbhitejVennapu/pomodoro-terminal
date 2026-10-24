import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  elapsedMs,
  isFinished,
  nextPhase,
  remainingMs,
  resetPhase,
  startTimer,
  togglePause,
} from '../src/engine.js';

const MIN = 60_000;
const t0 = 1_000_000;

describe('timer engine', () => {
  it('starts a running focus session of the configured length', () => {
    const timer = startTimer(DEFAULT_SETTINGS, 'work', t0);
    expect(timer.phase).toBe('work');
    expect(remainingMs(timer, t0)).toBe(25 * MIN);
  });

  it('counts only running time across pauses', () => {
    let timer = startTimer(DEFAULT_SETTINGS, 'work', t0);
    timer = togglePause(timer, t0 + 2 * MIN);
    timer = togglePause(timer, t0 + 10 * MIN);
    expect(elapsedMs(timer, t0 + 11 * MIN)).toBe(3 * MIN);
  });

  it('is finished once the phase duration has elapsed', () => {
    const timer = startTimer(DEFAULT_SETTINGS, 'work', t0);
    expect(isFinished(timer, t0 + 25 * MIN - 1)).toBe(false);
    expect(isFinished(timer, t0 + 25 * MIN)).toBe(true);
  });

  it('alternates work and short break', () => {
    const work = startTimer(DEFAULT_SETTINGS, 'work', t0);
    const shortBreak = nextPhase(work, DEFAULT_SETTINGS, t0);
    expect(shortBreak.phase).toBe('shortBreak');
    expect(remainingMs(shortBreak, t0)).toBe(5 * MIN);
    expect(nextPhase(shortBreak, DEFAULT_SETTINGS, t0).phase).toBe('work');
  });

  it('takes a long break after the configured number of work sessions', () => {
    let timer = startTimer(DEFAULT_SETTINGS, 'work', t0);
    for (let i = 0; i < 3; i++) {
      timer = nextPhase(timer, DEFAULT_SETTINGS, t0);
      expect(timer.phase).toBe('shortBreak');
      timer = nextPhase(timer, DEFAULT_SETTINGS, t0);
    }
    timer = nextPhase(timer, DEFAULT_SETTINGS, t0);
    expect(timer.phase).toBe('longBreak');
    expect(remainingMs(timer, t0)).toBe(15 * MIN);

    timer = nextPhase(timer, DEFAULT_SETTINGS, t0);
    expect(timer.phase).toBe('work');
    expect(timer.cycleCount).toBe(0);
  });

  it('keeps the tag across phases', () => {
    const work = startTimer(DEFAULT_SETTINGS, 'read', t0);
    expect(nextPhase(work, DEFAULT_SETTINGS, t0).tag).toBe('read');
  });

  it('resets the current phase without changing the cycle count', () => {
    let timer = nextPhase(startTimer(DEFAULT_SETTINGS, 'work', t0), DEFAULT_SETTINGS, t0);
    timer = nextPhase(timer, DEFAULT_SETTINGS, t0);
    timer = resetPhase(timer, DEFAULT_SETTINGS, t0 + MIN);
    expect(timer.phase).toBe('work');
    expect(timer.cycleCount).toBe(1);
    expect(elapsedMs(timer, t0 + MIN)).toBe(0);
  });
});
