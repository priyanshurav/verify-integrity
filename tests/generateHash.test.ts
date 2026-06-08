import { generateHash } from './../src/generateHash.js';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTempFile } from './utils/fs.js';
import { cleanupTempDir } from './utils/fs.js';
import { testFileContent, testFileHashSHA256, testFileHashSHA512 } from './fixtures/testFile.js';
import path from 'node:path';
import { dynamicMessages } from '../src/messages.js';
import { DEFAULT_BUFFER_SIZE } from '../src/constants.js';
import { chmodSync } from 'node:fs';

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
      const hash = await generateHash(testFilePath, 'sha256', DEFAULT_BUFFER_SIZE);
      assert.equal(hash, testFileHashSHA256);
    });
    it('should correctly calculate a SHA-512 hash', async () => {
      const hash = await generateHash(testFilePath, 'sha512', DEFAULT_BUFFER_SIZE);
      assert.equal(hash, testFileHashSHA512);
    });
  });

  describe('Validation & Error Handling', () => {
    it('should reject if the file does not exist', async () => {
      const fakePath = path.join(testDirPath, 'non-existent.txt');
      await assert.rejects(generateHash(fakePath, 'sha256', DEFAULT_BUFFER_SIZE), {
        message: dynamicMessages.fileNotFound(fakePath),
      });
    });

    it('should reject if the path is a directory', async () => {
      await assert.rejects(generateHash(testDirPath, 'sha256', DEFAULT_BUFFER_SIZE), {
        message: dynamicMessages.isDir(testDirPath),
      });
    });

    it(
      'should reject if the file lacks read permissions (EACCES)',
      { skip: process.platform === 'win32' ? 'chmod lacks ACL support on Windows' : false },
      async () => {
        const { dirPath, filePath } = createTempFile(testFileContent, 'no-access.txt');
        chmodSync(filePath, 0o000);
        try {
          await assert.rejects(generateHash(filePath, 'sha256', DEFAULT_BUFFER_SIZE), {
            message: dynamicMessages.permDenied(filePath),
          });
        } finally {
          chmodSync(filePath, 0o666);
          cleanupTempDir(dirPath);
        }
      }
    );
  });
  describe('Callback Lifecycle', () => {
    it('should trigger the onReady callback when the stream is ready', async () => {
      let callbackCalled = false;
      const onReady = () => {
        callbackCalled = true;
      };
      await generateHash(testFilePath, 'sha256', DEFAULT_BUFFER_SIZE, onReady);
      assert.equal(callbackCalled, true);
    });

    it('should NOT trigger onReady if the file does not exist', async () => {
      let callbackCalled = false;
      const onReady = () => {
        callbackCalled = true;
      };
      const fakePath = path.join(testDirPath, 'missing-file.txt');
      try {
        await generateHash(fakePath, 'sha256', DEFAULT_BUFFER_SIZE, onReady);
      } catch (err) {
        const { message } = err as Error;
        assert.ok(message.includes(dynamicMessages.fileNotFound(fakePath)));
      }
      assert.equal(callbackCalled, false);
    });
  });
});
