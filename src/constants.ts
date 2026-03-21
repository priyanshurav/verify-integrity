const isWindows = process.platform === 'win32';

export const icons = {
  success: isWindows ? '√' : '✔',
  error: isWindows ? 'X' : '✖',
  warning: isWindows ? '‼' : '⚠',
} as const;

export const messages = {
  hashesMatch: 'Hashes matched! Integrity verified.',
  hashesDidNotMatch: 'Hashes did not match! Integrity verification failed.',
  shortHashWarning:
    'Warning: Verifying with less than 8 characters is insecure and may result in false positives.',
} as const;
