import { parseArgs, type ParseArgsOptionsConfig } from 'node:util';
import type { ParsedArgs } from './types.js';
import { ALGORITHMS, DEFAULT_BUFFER_SIZE } from './constants.js';

const options = {
  algorithm: {
    type: 'string',
    default: ALGORITHMS[0],
    short: 'a',
  },
  buffer: {
    type: 'string',
    default: DEFAULT_BUFFER_SIZE.toString(10),
    short: 'b',
  },
  partial: {
    type: 'boolean',
    short: 'p',
    default: false,
  },
  quiet: {
    type: 'boolean',
    short: 'q',
    default: false,
  },
  help: {
    type: 'boolean',
    default: false,
    short: 'h',
  },
  version: {
    type: 'boolean',
    default: false,
    short: 'V',
  },
  'no-color': {
    type: 'boolean',
    default: false,
  },
} as const satisfies ParseArgsOptionsConfig;

export function parseArguments(): ParsedArgs {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options,
  });

  const [filePath, expectedHash] = positionals;
  const { partial, quiet, algorithm, buffer, version, help } = values;

  return {
    filePath,
    expectedHash,
    partial,
    quiet,
    algorithm: algorithm ?? '',
    bufferSize: buffer,
    noColor: values['no-color'],
    version,
    help,
  };
}
