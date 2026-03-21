import chalk from 'chalk';

export function formatHashDiff(expected: string, generated: string) {
  let expectedHighlighted = '';
  let generatedHighlighted = '';
  const maxLength = Math.max(expected.length, generated.length);

  for (let i = 0; i < maxLength; i++) {
    if (expected[i] === generated[i]) {
      expectedHighlighted += chalk.dim.green(expected[i]);
      generatedHighlighted += chalk.dim.red(generated[i]);
    } else {
      expectedHighlighted += chalk.bold.green(expected[i] || '');
      generatedHighlighted += chalk.bold.red(generated[i] || '');
    }
  }

  return { expectedHighlighted, generatedHighlighted };
}
