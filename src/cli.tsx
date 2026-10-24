#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './app.js';
import { parseArgs, USAGE, type ParsedArgs } from './args.js';
import { defaultConfigPath, loadConfig } from './config.js';
import { DEFAULT_SETTINGS, type Settings } from './engine.js';
import { formatStats } from './stats.js';
import { defaultLogPath, readSessions } from './store.js';

let parsed: ParsedArgs;
let settings: Settings;
try {
  parsed = parseArgs(process.argv.slice(2));
  settings = { ...DEFAULT_SETTINGS, ...loadConfig(defaultConfigPath()) };
} catch (err) {
  console.error(`${(err as Error).message}\n\n${USAGE}`);
  process.exit(1);
}

if (parsed.kind === 'help') {
  console.log(USAGE);
  process.exit(0);
}

if (parsed.kind === 'stats') {
  console.log(formatStats(readSessions(defaultLogPath()), parsed.range, new Date()));
  process.exit(0);
}

render(
  <App
    settings={{ ...settings, ...parsed.overrides }}
    tag={parsed.tag}
    logPath={defaultLogPath()}
  />,
);
