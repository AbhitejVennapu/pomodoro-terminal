import { describe, expect, it } from 'vitest';
import { parseArgs } from '../src/args.js';

describe('parseArgs', () => {
  it('starts with no tag, leaving the default to the config', () => {
    expect(parseArgs([])).toEqual({ kind: 'start', tag: undefined, overrides: {} });
  });

  it('accepts a positional tag after start', () => {
    expect(parseArgs(['start', 'work'])).toEqual({ kind: 'start', tag: 'work', overrides: {} });
  });

  it('accepts a tag flag', () => {
    expect(parseArgs(['-t', 'read'])).toEqual({ kind: 'start', tag: 'read', overrides: {} });
    expect(parseArgs(['start', '--tag', 'read'])).toEqual({ kind: 'start', tag: 'read', overrides: {} });
  });

  it('parses duration overrides', () => {
    expect(parseArgs(['work', '--work', '50', '--short', '10', '--long', '30'])).toEqual({
      kind: 'start',
      tag: 'work',
      overrides: { workMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 30 },
    });
  });

  it('rejects invalid durations', () => {
    expect(() => parseArgs(['--work', '0'])).toThrow('--work needs a positive number of minutes');
    expect(() => parseArgs(['--work', 'abc'])).toThrow('--work needs a positive number of minutes');
    expect(() => parseArgs(['--long'])).toThrow('--long needs a positive number of minutes');
  });

  it('rejects unknown options and extra positional arguments', () => {
    expect(() => parseArgs(['--bogus'])).toThrow('Unknown option: --bogus');
    expect(() => parseArgs(['work', 'read'])).toThrow('Unexpected argument: read');
  });

  it('returns help for -h', () => {
    expect(parseArgs(['-h'])).toEqual({ kind: 'help' });
  });

  it('parses stats with today as the default range', () => {
    expect(parseArgs(['stats'])).toEqual({ kind: 'stats', range: 'today' });
    expect(parseArgs(['stats', '--week'])).toEqual({ kind: 'stats', range: 'week' });
  });

  it('rejects unknown options for stats', () => {
    expect(() => parseArgs(['stats', '--month'])).toThrow('Unknown option for stats: --month');
  });

  it('lists types with no arguments', () => {
    expect(parseArgs(['types'])).toEqual({ kind: 'types-list' });
  });

  it('parses types add with optional label and color', () => {
    expect(parseArgs(['types', 'add', 'research', '--label', 'Research', '--color', 'magenta'])).toEqual({
      kind: 'types-add',
      id: 'research',
      label: 'Research',
      color: 'magenta',
    });
    expect(parseArgs(['types', 'add', 'read'])).toEqual({
      kind: 'types-add',
      id: 'read',
      label: undefined,
      color: undefined,
    });
  });

  it('rejects malformed types commands', () => {
    expect(() => parseArgs(['types', 'remove', 'read'])).toThrow('Unknown types command: remove');
    expect(() => parseArgs(['types', 'add'])).toThrow('types add needs a name');
    expect(() => parseArgs(['types', 'add', 'Deep Work'])).toThrow('must use lowercase letters');
    expect(() => parseArgs(['types', 'add', 'read', '--label'])).toThrow('--label needs a value');
  });
});
