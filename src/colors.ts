import type { Color } from './types.js';

export const createColors = (noColor: boolean) => {
  const format = (openCode: string, str: string): string => {
    return !noColor ? `\x1b[${openCode}m${str}\x1b[0m` : str;
  };
  const colors = {
    yellow: (message) => format('33', message),
    red: (message) => format('91', message),
    redBold: (message) => format('1;91', message),
    greenDim: (message) => format('32', message),
    greenBold: (message) => format('1;92', message),
    cyan: (message) => format('36', message),
    cyanBold: (message) => format('1;36', message),
  } satisfies Record<string, Color>;

  return colors;
};
