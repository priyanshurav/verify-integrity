import { describe, it } from 'node:test';
import { doHashesMatch } from '../src/doHashesMatch.js';
import assert from 'node:assert/strict';

describe('doHashesMatch()', () => {
  describe('Strict Mode (partial: false)', () => {
    it('should return true for an exact match', () => {
      const result = doHashesMatch('abcd', 'abcd', false);
      assert.equal(result, true);
    });
    it('should return true for an exact match with different casing', () => {
      const result = doHashesMatch('abcd', 'ABCD', false);
      assert.equal(result, true);
    });
    it('should return false when the expected hash is only a prefix', () => {
      const result = doHashesMatch('abcd', 'abcdefgh', false);
      assert.equal(result, false);
    });
    it('should return false for completely different hashes', () => {
      const result = doHashesMatch('abcd', 'efgh', false);
      assert.equal(result, false);
    });
  });

  describe('Partial Mode (partial: true)', () => {
    it('should return true when the generated hash starts with the expected prefix', () => {
      const result = doHashesMatch('abcd', 'abcdefgh', true);
      assert.equal(result, true);
    });
    it('should return true for a prefix match with different casing', () => {
      const result = doHashesMatch('abcd', 'ABCDEFGH', true);
      assert.equal(result, true);
    });
    it('should return false if the expected string is inside the hash, but not at the beginning', () => {
      const result = doHashesMatch('abcd', '1234abcd5678', true);
      assert.equal(result, false);
    });
    it('should return false for completely different hashes', () => {
      const result = doHashesMatch('abcd', 'efgh', true);
      assert.equal(result, false);
    });
  });

  describe('Empty String Handling', () => {
    const emptyCases = [
      {
        expected: '',
        generated: 'abcdef',
        partial: false,
        desc: 'expected hash is empty (strict)',
      },
      { expected: 'abc', generated: '', partial: false, desc: 'generated hash is empty (strict)' },
      { expected: '', generated: '', partial: false, desc: 'both hashes are empty (strict)' },
      {
        expected: '',
        generated: 'abcdef',
        partial: true,
        desc: 'expected hash is empty (partial)',
      },
      { expected: 'abc', generated: '', partial: true, desc: 'generated hash is empty (partial)' },
      { expected: '', generated: '', partial: true, desc: 'both hashes are empty (partial)' },
    ];

    for (const { expected, generated, partial, desc } of emptyCases) {
      it(`should return false when ${desc}`, () => {
        const result = doHashesMatch(expected, generated, partial);
        assert.equal(result, false);
      });
    }
  });
});
