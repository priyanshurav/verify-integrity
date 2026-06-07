import type { HASHES } from './constants.js';

export type Color = (message: string) => string;

export type Algorithm = keyof typeof HASHES;

export type ParsedArgs = {
  filePath: string | undefined;
  expectedHash: string | undefined;
  partial: boolean;
  quiet: boolean;
  algorithm: string;
  bufferSize: string;
  noColor: boolean;
  version: boolean;
  help: boolean;
};

export type Logger = {
  log: (message: string) => void;
  warn: (message: string) => void;
  info: (message: string) => void;
  fatal: (message: string) => never;
};
