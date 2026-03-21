import { describe, it } from 'node:test';
import assert from 'node:assert';
import { stripVTControlCharacters } from 'node:util';
import { formatHashDiff } from '../src/formatHashDiff';

describe('formatHashDiff()', () => {
  it('should preserve the original text content without mutation', () => {
    const expected = '4883c146';
    const generated = '4883c1ff';
    const { expectedHighlighted, generatedHighlighted } = formatHashDiff(expected, generated);
    assert.strictEqual(stripVTControlCharacters(expectedHighlighted), expected);
    assert.strictEqual(stripVTControlCharacters(generatedHighlighted), generated);
  });

  it('should handle uneven string lengths safely', () => {
    const { expectedHighlighted, generatedHighlighted } = formatHashDiff('ab', 'abc');
    assert.strictEqual(stripVTControlCharacters(expectedHighlighted), 'ab');
    assert.strictEqual(stripVTControlCharacters(generatedHighlighted), 'abc');
  });
});
