import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { dynamicMessages } from './messages.js';

export const generateHash = async (
  filePath: string,
  algorithm: string,
  bufferSize: number,
  onReady?: () => unknown
): Promise<string> => {
  const hashStream = createHash(algorithm);
  const readStream =
    filePath === '-'
      ? process.stdin
      : createReadStream(path.resolve(process.cwd(), filePath), {
          highWaterMark: bufferSize * 1024 * 1024,
        });

  readStream.once('readable', () => onReady?.());

  try {
    await pipeline(readStream, hashStream);
    return hashStream.digest('hex');
  } catch (e: unknown) {
    const code = (e as NodeJS.ErrnoException)?.code;
    switch (code) {
      case 'EISDIR':
        throw new Error(dynamicMessages.isDir(filePath), { cause: e });
      case 'ENOENT':
        throw new Error(dynamicMessages.fileNotFound(filePath), { cause: e });
      case 'EACCES':
        throw new Error(dynamicMessages.permDenied(filePath), { cause: e });
      default:
        throw e;
    }
  }
};
