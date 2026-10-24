#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './app.js';
import { parseArgs, USAGE, type ParsedArgs } from './args.js';
import { DEFAULT_SETTINGS } from './engine.js';
import { defaultLogPath } from './store.js';

let parsed: ParsedArgs;
try {
  parsed = parseArgs(process.argv.slice(2));
} catch (err) {
  console.error(`${(err as Error).message}\n\n${USAGE}`);
  process.exit(1);
}

if (parsed.kind === 'help') {
  console.log(USAGE);
  process.exit(0);
}

render(
  <App
    settings={{ ...DEFAULT_SETTINGS, ...parsed.overrides }}
    tag={parsed.tag}
    logPath={defaultLogPath()}
  />,
);
