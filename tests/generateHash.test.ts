import { generateHash } from './../src/generateHash.js';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert';
import { createTempFile } from './utils/fs.js';
import { cleanupTempDir } from './utils/fs.js';
import { testFileContent, testFileHashSHA256 } from './fixtures/testFile.js';
import path from 'node:path';

describe('generateHash()', () => {
  let testDirPath: string;
  let testFilePath: string;

  before(() => {
    const { dirPath, filePath } = createTempFile(testFileContent);
    testDirPath = dirPath;
    testFilePath = filePath;
  });

  after(() => {
    if (!testDirPath) return;
    cleanupTempDir(testDirPath);
  });

  describe('Successful Hashing', () => {
    it('should correctly calculate a SHA-256 hash', async () => {
      const hash = await generateHash(testFilePath, 'sha256');
      assert.strictEqual(hash, testFileHashSHA256);
    });
  });

  describe('Validation & Error Handling', () => {
    it('should reject if the file path is an empty string', async () => {
      await assert.rejects(generateHash('', 'sha256'), { message: /path/i });
    });

    it('should reject if the algorithm is an empty string', async () => {
      await assert.rejects(generateHash(testFilePath, ''), { message: /algorithm/i });
    });

    it('should reject if the file does not exist', async () => {
      const fakePath = path.join(testDirPath, 'non-existent.txt');
      await assert.rejects(generateHash(fakePath, 'sha256'), { code: 'ENOENT' });
    });
  });
});
