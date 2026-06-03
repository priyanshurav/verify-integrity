import type { Colour } from './types.js';

export const createColours = (noColour: boolean) => {
  const format = (openCode: string, str: string): string => {
    return !noColour ? `\x1b[${openCode}m${str}\x1b[0m` : str;
  };
  const colours = {
    yellow: (message) => format('33', message),
    red: (message) => format('31', message),
    redDim: (message) => format('2;31', message),
    redBold: (message) => format('1;31', message),
    green: (message) => format('32', message),
    greenDim: (message) => format('2;32', message),
    greenBold: (message) => format('1;32', message),
    cyan: (message) => format('36', message),
    cyanBold: (message) => format('1;36', message),
  } satisfies Record<string, Colour>;

  return colours;
};
