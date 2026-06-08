import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createColors } from '../src/colors.js';

describe('createColors()', () => {
  describe('when noColor is false', () => {
    const colors = createColors(false);

    const cases: [keyof ReturnType<typeof createColors>, string][] = [
      ['yellow', '33'],
      ['red', '91'],
      ['redBold', '1;91'],
      ['greenDim', '32'],
      ['greenBold', '1;92'],
      ['cyan', '36'],
    ];

    for (const [name, code] of cases) {
      it(`should wrap with ANSI code ${code} for ${name}`, () => {
        assert.equal(colors[name]('test'), `\x1b[${code}mtest\x1b[0m`);
      });
    }
  });

  describe('when noColor is true', () => {
    const colors = createColors(true);

    it('should return the string unchanged for all colors', () => {
      for (const fn of Object.values(colors)) {
        assert.equal(fn('test'), 'test');
      }
    });
  });
});
