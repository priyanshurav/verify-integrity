import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

export const generateHash = (absoluteFilePath: string, algorithm: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!absoluteFilePath) return reject(new Error('The file path provided is empty or invalid.'));
    if (!algorithm) return reject(new Error('A hashing algorithm must be specified.'));

    const hash = createHash(algorithm);
    const stream = createReadStream(absoluteFilePath);

    stream.on('error', (e) => reject(e));

    stream.on('data', (chunk) => hash.update(chunk));

    stream.on('end', () => {
      const finalHash = hash.digest('hex');
      resolve(finalHash);
    });
  });
};
