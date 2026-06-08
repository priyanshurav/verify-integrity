import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { stripVTControlCharacters } from 'node:util';
import { formatHashDiff } from '../src/formatHashDiff.js';

describe('formatHashDiff()', () => {
  it('should preserve the original text content without mutation', () => {
    const expected = '4883c146';
    const generated = '4883c1ff';
    const { expectedHighlighted, generatedHighlighted } = formatHashDiff(expected, generated, false);
    assert.equal(stripVTControlCharacters(expectedHighlighted), expected);
    assert.equal(stripVTControlCharacters(generatedHighlighted), generated);
  });

  it('should handle uneven string lengths safely', () => {
    const { expectedHighlighted, generatedHighlighted } = formatHashDiff('ab', 'abc', false);
    assert.equal(stripVTControlCharacters(expectedHighlighted), 'ab');
    assert.equal(stripVTControlCharacters(generatedHighlighted), 'abc');
  });
});
