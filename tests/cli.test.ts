import { after, before, describe, it } from 'node:test';
import path from 'node:path';
import { promisify, stripVTControlCharacters } from 'node:util';
import { exec } from 'node:child_process';
import assert from 'node:assert/strict';
import { createTempFile, cleanupTempDir } from './utils/fs.js';
import { testFileHashSHA256, testFileContent, testFileHashSHA512 } from './fixtures/testFile.js';
import packageData from '../package.json' with { type: 'json' };
import { dynamicMessages, staticMessages } from '../src/messages.js';
import { HASHES, icons, MIN_HASH_ERROR_LENGTH, MIN_HASH_WARN_LENGTH, WEAK_ALGORITHMS } from '../src/constants.js';
import type { Algorithm } from '../src/types.js';

const execAsync = promisify(exec);

describe('CLI End-to-End Execution', () => {
  let testDirPath: string;
  let testFilePath: string;
  const partialHash = testFileHashSHA256.slice(0, 10);
  const cliPath = path.resolve('./dist/cli.js');

  async function runCLI(args: string, stdin?: string): Promise<{ code: number; stdout: string; stderr: string }> {
    const command = stdin
      ? `node -e "process.stdout.write('${stdin}')" | node "${cliPath}" ${args}`
      : `node "${cliPath}"${args ? ` ${args}` : ''}`;

    try {
      const { stdout, stderr } = await execAsync(command);
      return { code: 0, stdout, stderr };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.code === 'ERR_ASSERTION') throw err;
      return {
        code: typeof err.code === 'number' ? err.code : 1,
        stdout: err.stdout ?? '',
        stderr: err.stderr ?? '',
      };
    }
  }

  before(() => {
    const { dirPath, filePath } = createTempFile(testFileContent);
    testDirPath = dirPath;
    testFilePath = filePath;
  });

  after(() => {
    if (!testDirPath) return;
    cleanupTempDir(testDirPath);
  });

  describe('Hash Matching (Success)', () => {
    it('should exit with code 0 and print success message, algorithm, and generated hash on a full match', async () => {
      const { code, stdout } = await runCLI(`"${testFilePath}" ${testFileHashSHA256}`);
      assert.equal(code, 0);
      assert.ok(stdout.includes(staticMessages.hashesMatch));
      assert.ok(stdout.includes('Algorithm:'));
      assert.ok(stdout.includes('Generated:'));
      assert.ok(stdout.includes(testFileHashSHA256));
    });

    it('should exit with code 0 and print success message on a match with sha512', async () => {
      const { code, stdout } = await runCLI(`"${testFilePath}" ${testFileHashSHA512} -a sha512`);
      assert.equal(code, 0);
      assert.ok(stdout.includes(staticMessages.hashesMatch));
    });

    it('should correctly match when the expected hash is provided in uppercase', async () => {
      const { code, stdout } = await runCLI(`"${testFilePath}" ${testFileHashSHA256.toUpperCase()}`);
      assert.equal(code, 0);
      assert.ok(stdout.includes(staticMessages.hashesMatch));
    });
  });

  describe('Hash Mismatch (Failure)', () => {
    it('should exit with code 1 and print mismatch message, algorithm, expected hash, and generated hash on a mismatch', async () => {
      const wrongHash = 'a'.repeat(64);
      const { code, stdout } = await runCLI(`"${testFilePath}" ${wrongHash}`);
      const strippedStdout = stripVTControlCharacters(stdout);

      assert.equal(code, 1);
      assert.ok(strippedStdout.includes(staticMessages.hashesDidNotMatch));
      assert.ok(strippedStdout.includes('Algorithm:'));
      assert.ok(strippedStdout.includes('Expected:'));
      assert.ok(strippedStdout.includes('Generated:'));
      assert.ok(strippedStdout.includes(wrongHash));
      assert.ok(strippedStdout.includes(testFileHashSHA256));
    });
  });

  describe('Partial Matching (--partial, -p)', () => {
    it('should exit with code 0 on a partial match when --partial flag is used', async () => {
      const { code, stdout } = await runCLI(`"${testFilePath}" ${partialHash} --partial`);
      assert.equal(code, 0);
      assert.ok(stdout.includes(staticMessages.hashesMatch));
    });

    it('should exit with code 0 on a partial match when -p alias is used', async () => {
      const { code, stdout } = await runCLI(`"${testFilePath}" ${partialHash} -p`);
      assert.equal(code, 0);
      assert.ok(stdout.includes(staticMessages.hashesMatch));
    });

    it('should exit with code 1 on a partial hash when --partial flag is omitted', async () => {
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${partialHash}`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      assert.ok(stderr.includes(dynamicMessages.hashLengthMismatch('sha256', partialHash.length.toString(10))));
    });

    it('should exit with code 1 and write to stderr when partial hash is below the minimum error length', async () => {
      const tooShort = testFileHashSHA256.substring(0, MIN_HASH_ERROR_LENGTH - 1);
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${tooShort} -p`);
      assert.equal(code, 1);
      assert.equal(stdout, '');
      assert.ok(stderr.includes(staticMessages.partialHashTooSmall));
    });

    it('should write a warning to stderr (with icon) when partial hash is below the minimum warn length', async () => {
      const shortHash = testFileHashSHA256.slice(0, MIN_HASH_WARN_LENGTH - 1);
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${shortHash} -p`);
      assert.equal(code, 0);
      assert.ok(stdout.includes(staticMessages.hashesMatch));
      assert.ok(stderr.includes(staticMessages.shortHashWarning));
      assert.ok(stderr.includes(icons.warning));
    });
  });

  describe('Quiet Mode (--quiet, -q)', () => {
    it('should exit with code 0 and produce no output when --quiet is used on a match', async () => {
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${testFileHashSHA256} --quiet`);
      assert.equal(code, 0);
      assert.equal(stdout.trim(), '');
      assert.equal(stderr.trim(), '');
    });

    it('should exit with code 1 and produce no output when -q alias is used on a mismatch', async () => {
      const wrongHash = 'a'.repeat(64);
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${wrongHash} -q`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      assert.equal(stderr.trim(), '');
    });
  });

  describe('Input Validation', () => {
    it('should show help if no arguments are provided', async () => {
      const { code, stdout, stderr } = await runCLI('');
      assert.equal(code, 0);
      assert.equal(stderr, '');
      assert.ok(stdout.includes('Usage: verify-integrity'));
      assert.ok(stdout.includes('Options:'));
    });

    it('should exit with code 1 and write to stderr when a file path is provided but the expected hash is missing', async () => {
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}"`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      assert.ok(stderr.includes(staticMessages.missingFileOrHash));
    });

    it('should exit with code 1 and write to stderr when the expected hash is not valid hex', async () => {
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ZZZZZZZZZZ`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      assert.ok(stderr.includes(staticMessages.invalidExpectedHash));
    });

    it('should exit with code 1 and write to stderr when the file path does not exist', async () => {
      const fakePath = path.join(testDirPath, 'non-existent.txt');
      const { code, stderr } = await runCLI(`"${fakePath}" ${testFileHashSHA256}`);
      assert.equal(code, 1);
      assert.ok(stderr.includes(dynamicMessages.fileNotFound(fakePath)));
    });

    it('should exit with code 1 and write to stderr when the path is a directory', async () => {
      const { code, stderr } = await runCLI(`"${testDirPath}" ${testFileHashSHA256}`);
      assert.equal(code, 1);
      assert.ok(stderr.includes(dynamicMessages.isDir(testDirPath)));
    });
  });

  describe('Algorithm Flag (--algorithm, -a)', () => {
    it('should exit with code 1 and write to stderr when an unsupported algorithm is specified', async () => {
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${testFileHashSHA256} -a md4`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      assert.ok(stderr.includes(dynamicMessages.unsupportedAlg('md4')));
    });

    it('should exit with code 1 and write to stderr when -a is passed an empty string', async () => {
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${testFileHashSHA256} -a ""`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      const eitherMessage =
        stderr.includes(staticMessages.noSupportedAlg) || stderr.includes(dynamicMessages.unsupportedAlg(''));
      assert.ok(eitherMessage);
    });

    it('should write a weak-algorithm warning to stderr', async () => {
      const weakAlg = WEAK_ALGORITHMS[0] ?? '';
      const hash = 'a'.repeat(HASHES[weakAlg as Algorithm].hexLength ?? 0);
      const { stderr } = await runCLI(`"${testFilePath}" ${hash} -a ${weakAlg}`);
      assert.ok(stderr.includes(dynamicMessages.weakAlgo(weakAlg)));
      assert.ok(stderr.includes(icons.warning));
    });
  });

  describe('Buffer Size (--buffer, -b)', () => {
    it('should exit with code 1 and write to stderr when buffer size is not a positive integer', async () => {
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${testFileHashSHA256} -b 0`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      assert.ok(stderr.includes(dynamicMessages.bufferSizeNotInt('0')));
    });

    it('should exit with code 1 and write to stderr when buffer size is a non-numeric string', async () => {
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${testFileHashSHA256} -b abc`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      assert.ok(stderr.includes(dynamicMessages.bufferSizeNotInt('abc')));
    });
  });

  describe('Strict Hash Length Validation', () => {
    it('should exit with code 1 and write to stderr when the expected hash length is incorrect for the default algorithm (sha256)', async () => {
      const invalidLengthHash = 'a'.repeat(32);
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${invalidLengthHash}`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      assert.ok(
        stderr.includes(dynamicMessages.hashLengthMismatch('sha256', invalidLengthHash.length.toString(10)))
      );
    });

    it('should exit with code 1 and write to stderr when the expected hash length is incorrect for a specified algorithm', async () => {
      const invalidLengthHash = 'b'.repeat(64);
      const algo = 'md5';
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${invalidLengthHash} -a ${algo}`);
      assert.equal(code, 1);
      assert.equal(stdout.trim(), '');
      assert.ok(stderr.includes(dynamicMessages.hashLengthMismatch(algo, '64')));
    });

    it('should bypass the strict length check and successfully match when --partial flag is provided', async () => {
      const validPartialHash = testFileHashSHA256.substring(0, 16);
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${validPartialHash} --partial`);
      assert.equal(code, 0);
      assert.ok(stdout.includes(staticMessages.hashesMatch));
      assert.equal(stderr.includes('Invalid SHA256 hash length'), false);
    });
  });

  describe('No-Color Mode (--no-color)', () => {
    it('should exit with code 0 and produce no ANSI escape codes when the --no-color alias is used on a match', async () => {
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${testFileHashSHA256} --no-color`);
      assert.equal(code, 0);
      assert.ok(stdout.includes(staticMessages.hashesMatch));
      assert.equal(stdout.includes('\x1b['), false);
      assert.equal(stderr.includes('\x1b['), false);
    });

    it('should exit with code 1 and produce no ANSI escape codes in stdout when --no-color is used on a mismatch', async () => {
      const wrongHash = 'a'.repeat(64);
      const { code, stdout, stderr } = await runCLI(`"${testFilePath}" ${wrongHash} --no-color`);
      assert.equal(code, 1);
      assert.ok(stdout.includes(staticMessages.hashesDidNotMatch));
      assert.equal(stdout.includes('\x1b['), false);
      assert.equal(stderr.includes('\x1b['), false);
    });
  });

  describe('Standard Input (Stdin "-")', () => {
    it('should exit with code 0 on a match when reading from stdin via the "-" path', async () => {
      const { code, stdout } = await runCLI(`- ${testFileHashSHA256}`, testFileContent);
      assert.equal(code, 0);
      assert.ok(stdout.includes(staticMessages.hashesMatch));
    });

    it('should exit with code 1 on a mismatch when reading from stdin via the "-" path', async () => {
      const wrongHash = 'a'.repeat(64);
      const { code, stdout } = await runCLI(`- ${wrongHash}`, testFileContent);
      assert.equal(code, 1);
      assert.ok(stdout.includes(staticMessages.hashesDidNotMatch));
    });
  });

  describe('Help and Version Outputs', () => {
    it('should display identical help text and exit with code 0 for both -h and --help', async () => {
      const shortHelp = await runCLI('-h');
      const longHelp = await runCLI('--help');
      assert.equal(shortHelp.stdout, longHelp.stdout);
      assert.ok(shortHelp.stdout.includes('Usage: verify-integrity'));
      assert.ok(shortHelp.stdout.includes('Options:'));
    });

    it('should output the version number and exit with code 0 for both -V and --version', async () => {
      const shortVersion = await runCLI('-V');
      const longVersion = await runCLI('--version');
      assert.ok(longVersion.stdout.includes(packageData.version));
      assert.ok(shortVersion.stdout.includes(packageData.version));
    });
  });
});
