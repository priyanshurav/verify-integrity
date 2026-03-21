export function doHashesMatch(expected: string, generated: string, partial: boolean): boolean {
  if (!expected || !generated) return false;
  expected = expected.toLowerCase();
  generated = generated.toLowerCase();
  if (partial) {
    return generated.startsWith(expected);
  } else {
    return generated === expected;
  }
}
