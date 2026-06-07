import { ALGORITHMS, HASHES } from './constants.js';
import type { Algorithm } from './types.js';

export const staticMessages = {
  hashesMatch: 'Hashes matched! Integrity verified.',
  hashesDidNotMatch: 'Hashes did not match! Integrity verification failed.',
  shortHashWarning: 'Verifying with less than 8 characters is insecure and may result in false positives.',
  partialHashTooSmall: 'partial hash too short (min 4 chars).',
  noSupportedAlg: 'No supported algorithm found',
  missingFileOrHash: 'missing file or expected hash.',
  invalidExpectedHash: 'expected hash is not a valid hex',
} as const;

export const dynamicMessages = {
  isDir: (filePath) => `The path "${filePath}" is a directory. You must provide a file.`,
  fileNotFound: (filePath) => `The file "${filePath}" does not exist.`,
  permDenied: (filePath) => `Permission denied to read file "${filePath}"`,
  bufferSizeNotInt: (val) => `"${val}" is not a positive integer`,
  unsupportedAlg: (algorithm) => `Unsupported algorithm "${algorithm}". Valid choices: ${ALGORITHMS.join(', ')}`,
  hashLengthMismatch: (algo, receivedLength) =>
    `Invalid ${algo.toUpperCase()} hash length (expected exactly ${HASHES[algo as Algorithm].hexLength} characters, received ${receivedLength}).`,
  weakAlgo: (algo) =>
    `${algo.toUpperCase()} is cryptographically broken and should not be used for security-critical verification.`,
} satisfies Record<string, (...args: string[]) => string>;
