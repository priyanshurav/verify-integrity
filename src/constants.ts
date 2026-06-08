import { getHashes } from 'node:crypto';
import type { Algorithm } from './types.js';

export const icons = {
  success: '✓',
  error: '✗',
  warning: '!!',
} as const;

export const MIN_HASH_ERROR_LENGTH = 4;
export const MIN_HASH_WARN_LENGTH = 8;
export const DEFAULT_BUFFER_SIZE = 4; // in MiB

export const HASHES = {
  sha256: { hexLength: 64 },
  sha512: { hexLength: 128 },
  sha1: { hexLength: 40 },
  md5: { hexLength: 32 },
} as const;

export const ALGORITHMS = Object.freeze(Object.keys(HASHES).filter((a) => getHashes().includes(a)) as Algorithm[]);
export const WEAK_ALGORITHMS = Object.freeze(['md5', 'sha1'] as Algorithm[]);
