import { after, before, describe, it } from 'node:test';
import path from 'node:path';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import assert from 'node:assert';
import { createTempFile } from './utils/fs';
import { cleanupTempDir } from './utils/fs';
import { messages } from './../src/constants.js';
import { testFileHashSHA256, testFileContent, testFileHashSHA512 } from './fixtures/testFile';

const execAsync = promisify(exec);

describe('CLI End-to-End Execution', () => {
  let testDirPath: string;
  let testFilePath: string;
  const partialHash = testFileHashSHA256.slice(0, 10);
  const cliPath = path.resolve('./dist/cli.js');

  before(() => {
    const { dirPath, filePath } = createTempFile(testFileContent);
    testDirPath = dirPath;
    testFilePath = filePath;
  });

  after(() => {
    if (!testDirPath) return;
    cleanupTempDir(testDirPath);
  });

  it('should exit with code 0 and success message on a match', async () => {
    const { stdout } = await execAsync(`node "${cliPath}" "${testFilePath}" ${testFileHashSHA256}`);
    assert.ok(stdout.includes(messages.hashesMatch));
  });

  it('should exit with code 0 and success message on a match with a different algorithm', async () => {
    const { stdout } = await execAsync(
      `node "${cliPath}" "${testFilePath}" ${testFileHashSHA512} -a sha512`
    );
    assert.ok(stdout.includes(messages.hashesMatch));
  });

  it('should exit with code 1 on a hash mismatch', async () => {
    const wrongHash = '1234567890abcdef';
    try {
      await execAsync(`node "${cliPath}" "${testFilePath}" ${wrongHash}`);
      assert.fail('CLI should have exited with an error');
    } catch (err) {
      const error = err as { code: number | string; stdout: string };
      if (error.code === 'ERR_ASSERTION') throw err;
      assert.strictEqual(error.code, 1);
      assert.ok(error.stdout.includes(messages.hashesDidNotMatch));
    }
  });

  it('should exit with code 0 on a partial match when --partial flag is used', async () => {
    const { stdout } = await execAsync(
      `node "${cliPath}" "${testFilePath}" ${partialHash} --partial`
    );
    assert.ok(stdout.includes(messages.hashesMatch));
  });

  it('should exit with code 0 on a partial match when -p alias is used', async () => {
    const { stdout } = await execAsync(`node "${cliPath}" "${testFilePath}" ${partialHash} -p`);
    assert.ok(stdout.includes(messages.hashesMatch));
  });

  it('should exit with code 1 on a partial match if --partial is omitted', async () => {
    try {
      await execAsync(`node "${cliPath}" "${testFilePath}" ${partialHash}`);
      assert.fail('CLI should have exited with an error');
    } catch (err) {
      const error = err as { code: number | string; stdout: string };
      if (error.code === 'ERR_ASSERTION') throw err;
      assert.strictEqual(error.code, 1);
      assert.ok(error.stdout.includes(messages.hashesDidNotMatch));
    }
  });
  it('should output a warning to stderr when using a partial hash under 8 characters', async () => {
    const dangerouslyShortHash = testFileHashSHA256.slice(0, 7);
    const { stdout, stderr } = await execAsync(
      `node "${cliPath}" "${testFilePath}" ${dangerouslyShortHash} -p`
    );
    assert.ok(stdout.includes(messages.hashesMatch));
    assert.ok(stderr.includes(messages.shortHashWarning));
  });
  it('should exit with code 0 and output nothing when --quiet flag is used on a match', async () => {
    const { stdout, stderr } = await execAsync(
      `node "${cliPath}" "${testFilePath}" ${testFileHashSHA256} --quiet`
    );
    assert.strictEqual(stdout.trim(), '');
    assert.strictEqual(stderr.trim(), '');
  });

  it('should exit with code 1 and output nothing when -q alias is used on a mismatch', async () => {
    const wrongHash = '1234567890abcdef';
    try {
      await execAsync(`node "${cliPath}" "${testFilePath}" ${wrongHash} -q`);
      assert.fail('CLI should have exited with an error');
    } catch (err) {
      const error = err as { code: number | string; stdout: string; stderr: string };
      if (error.code === 'ERR_ASSERTION') throw err;
      assert.strictEqual(error.code, 1);
      assert.strictEqual(error.stdout.trim(), '');
      assert.strictEqual(error.stderr.trim(), '');
    }
  });

  it('should exit with code 1 if file path does not exist', async () => {
    try {
      const fakePath = path.join(testDirPath, 'non-existent.txt');
      await execAsync(`node "${cliPath}" "${fakePath}" ${testFileHashSHA256}`);
      assert.fail('CLI should have exited with an error');
    } catch (err) {
      const error = err as { code: number | string; stdout: string; stderr: string };
      if (error.code === 'ERR_ASSERTION') throw err;
      assert.strictEqual(error.code, 1);
      assert.strictEqual(error.stdout.trim(), '');
      assert.ok(error.stderr.includes('ENOENT'));
    }
  });
});
