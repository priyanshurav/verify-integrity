import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseArguments } from '../src/parseArguments.js';
import { ALGORITHMS } from '../src/constants.js';

function setArgv(...args: string[]) {
  process.argv = ['node', 'script', ...args];
}

describe('parseArguments', () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('positional arguments', () => {
    it('should parse filePath and expectedHash', () => {
      setArgv('file.txt', 'abc123');
      const result = parseArguments();
      assert.equal(result.filePath, 'file.txt');
      assert.equal(result.expectedHash, 'abc123');
    });

    it('should parse positionals correctly when flags appear before them', () => {
      setArgv('--partial', 'file.txt', 'abc123');
      const result = parseArguments();
      assert.equal(result.filePath, 'file.txt');
      assert.equal(result.expectedHash, 'abc123');
    });

    it('should parse positionals correctly when flags appear after them', () => {
      setArgv('file.txt', 'abc123', '--quiet');
      const result = parseArguments();
      assert.equal(result.filePath, 'file.txt');
      assert.equal(result.expectedHash, 'abc123');
    });
  });

  describe('default values', () => {
    it(`should default algorithm to ${ALGORITHMS[0]}`, () => {
      setArgv('file.txt', 'abc123');
      const result = parseArguments();
      assert.equal(result.algorithm, ALGORITHMS[0]);
    });

    it('should default partial to false', () => {
      setArgv('file.txt', 'abc123');
      const result = parseArguments();
      assert.equal(result.partial, false);
    });

    it('should default quiet to false', () => {
      setArgv('file.txt', 'abc123');
      const result = parseArguments();
      assert.equal(result.quiet, false);
    });

    it('should default noColor to false', () => {
      setArgv('file.txt', 'abc123');
      const result = parseArguments();
      assert.equal(result.noColor, false);
    });

    it('should default help to false', () => {
      setArgv('file.txt', 'abc123');
      const result = parseArguments();
      assert.equal(result.help, false);
    });

    it('should default version to false', () => {
      setArgv('file.txt', 'abc123');
      const result = parseArguments();
      assert.equal(result.version, false);
    });
  });

  describe('--algorithm / -a', () => {
    it('should accept --algorithm long flag', () => {
      setArgv('file.txt', 'abc123', '--algorithm', 'sha512');
      const result = parseArguments();
      assert.equal(result.algorithm, 'sha512');
    });

    it('should accept -a short flag', () => {
      setArgv('file.txt', 'abc123', '-a', 'md5');
      const result = parseArguments();
      assert.equal(result.algorithm, 'md5');
    });

    it('should pass through an unsupported algorithm without validation', () => {
      setArgv('file.txt', 'abc123', '--algorithm', 'blowfish');
      const result = parseArguments();
      assert.equal(result.algorithm, 'blowfish');
    });
  });

  describe('--partial / -p', () => {
    it('should accept --partial long flag', () => {
      setArgv('file.txt', 'abc123', '--partial');
      const result = parseArguments();
      assert.equal(result.partial, true);
    });

    it('should accept -p short flag', () => {
      setArgv('file.txt', 'abc123', '-p');
      const result = parseArguments();
      assert.equal(result.partial, true);
    });
  });

  describe('--quiet / -q', () => {
    it('should accept --quiet long flag', () => {
      setArgv('file.txt', 'abc123', '--quiet');
      const result = parseArguments();
      assert.equal(result.quiet, true);
    });

    it('should accept -q short flag', () => {
      setArgv('file.txt', 'abc123', '-q');
      const result = parseArguments();
      assert.equal(result.quiet, true);
    });
  });

  describe('--no-color', () => {
    it('should accept --no-color', () => {
      setArgv('file.txt', 'abc123', '--no-color');
      const result = parseArguments();
      assert.equal(result.noColor, true);
    });
  });

  describe('--help / -h', () => {
    it('should accept --help long flag', () => {
      setArgv('--help');
      const result = parseArguments();
      assert.equal(result.help, true);
    });

    it('should accept -h short flag', () => {
      setArgv('-h');
      const result = parseArguments();
      assert.equal(result.help, true);
    });

    it('should set filePath and expectedHash to undefined when --help is passed without positionals', () => {
      setArgv('--help');
      const result = parseArguments();
      assert.equal(result.filePath, undefined);
      assert.equal(result.expectedHash, undefined);
    });
  });

  describe('--version / -V', () => {
    it('should accept --version long flag', () => {
      setArgv('--version');
      const result = parseArguments();
      assert.equal(result.version, true);
    });

    it('should accept -V short flag', () => {
      setArgv('-V');
      const result = parseArguments();
      assert.equal(result.version, true);
    });

    it('should set filePath and expectedHash to undefined when --version is passed without positionals', () => {
      setArgv('--version');
      const result = parseArguments();
      assert.equal(result.filePath, undefined);
      assert.equal(result.expectedHash, undefined);
    });
  });

  describe('--buffer / -b', () => {
    it('should parse buffer as a string value', () => {
      setArgv('file.txt', 'abc123', '--buffer', '8192');
      const result = parseArguments();
      assert.equal(result.bufferSize, '8192');
    });

    it('should accept -b short flag', () => {
      setArgv('file.txt', 'abc123', '-b', '8192');
      const result = parseArguments();
      assert.equal(result.bufferSize, '8192');
    });
  });

  describe('multiple flags', () => {
    it('should handle --partial and --quiet together', () => {
      setArgv('file.txt', 'abc123', '--partial', '--quiet');
      const result = parseArguments();
      assert.equal(result.partial, true);
      assert.equal(result.quiet, true);
    });

    it('should handle --no-color with --algorithm', () => {
      setArgv('file.txt', 'abc123', '--no-color', '--algorithm', 'sha1');
      const result = parseArguments();
      assert.equal(result.noColor, true);
      assert.equal(result.algorithm, 'sha1');
    });

    it('should handle combined short flags -p -q', () => {
      setArgv('file.txt', 'abc123', '-p', '-q');
      const result = parseArguments();
      assert.equal(result.partial, true);
      assert.equal(result.quiet, true);
    });
  });

  describe('error handling', () => {
    it('should throw for unknown flags', () => {
      setArgv('file.txt', 'abc123', '--unknown-flag');
      assert.throws(() => parseArguments());
    });
  });
});
