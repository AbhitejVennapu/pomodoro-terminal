#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './app.js';
import { parseArgs, USAGE, type ParsedArgs } from './args.js';
import { addType, defaultConfigPath, formatTypes, loadConfig, resolveTag, type Config } from './config.js';
import { Dashboard } from './dashboard.js';
import { DEFAULT_SETTINGS } from './engine.js';
import { formatStats } from './stats.js';
import { defaultLogPath, readSessions } from './store.js';

let parsed: ParsedArgs;
let config: Config;
try {
  parsed = parseArgs(process.argv.slice(2));
  config = loadConfig(defaultConfigPath());
} catch (err) {
  console.error(`${(err as Error).message}\n\n${USAGE}`);
  process.exit(1);
}

const configPath = defaultConfigPath();
const knownIds = Object.keys(config.types);

function startSession(args: Extract<ParsedArgs, { kind: 'start' }>): void {
  let tag: string;
  try {
    tag = resolveTag(config.types, args.tag);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  render(
    <App
      settings={{ ...DEFAULT_SETTINGS, ...config.settings, ...args.overrides }}
      tag={tag}
      logPath={defaultLogPath()}
    />,
  );
}

switch (parsed.kind) {
  case 'help':
    console.log(USAGE);
    process.exit(0);
    break;

  case 'stats':
    console.log(formatStats(readSessions(defaultLogPath()), parsed.range, new Date(), knownIds));
    process.exit(0);
    break;

  case 'dashboard':
    render(<Dashboard records={readSessions(defaultLogPath())} types={config.types} />);
    break;

  case 'types-list':
    console.log(formatTypes(config.types));
    process.exit(0);
    break;

  case 'types-add':
    try {
      addType(configPath, parsed.id, { label: parsed.label, color: parsed.color });
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
    console.log(`Added type "${parsed.id}"`);
    process.exit(0);
    break;

  case 'start':
    startSession(parsed);
    break;
}
