import { createColors } from './colors.js';

export function formatHashDiff(expected: string, generated: string, noColor: boolean) {
  const colors = createColors(noColor);
  let expectedHighlighted = '';
  let generatedHighlighted = '';
  const maxLength = Math.max(expected.length, generated.length);

  for (let i = 0; i < maxLength; i++) {
    const expChar = expected[i] ?? '';
    const genChar = generated[i] ?? '';
    const expCharLower = expChar.toLowerCase();
    const genCharLower = genChar.toLowerCase();
    if (expCharLower === genCharLower) {
      expectedHighlighted += expChar ? colors.greenDim(expChar) : '';
      generatedHighlighted += genChar ? colors.greenDim(genChar) : '';
    } else {
      expectedHighlighted += expChar ? colors.greenBold(expChar) : '';
      generatedHighlighted += genChar ? colors.redBold(genChar) : '';
    }
  }

  return { expectedHighlighted, generatedHighlighted };
}
