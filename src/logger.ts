import { createColors } from './colors.js';
import { icons } from './constants.js';
import type { Logger } from './types.js';

export const createLogger = (quiet: boolean, noColor: boolean): Logger => {
  const colors = createColors(noColor);
  const info = (message: string): void => {
    if (!quiet) console.log(colors.cyan(message));
  };
  const log = (message: string): void => {
    if (!quiet) console.log(message);
  };
  const fatal = (message: string): never => {
    if (!quiet) console.error(colors.red(`${icons.error} Error: ${message}`));
    process.exit(1);
  };
  const warn = (message: string): void => {
    if (!quiet) console.warn(colors.yellow(`${icons.warning} Warning: ${message}`));
  };

  return { log, info, warn, fatal };
};
