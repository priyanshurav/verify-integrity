import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function cleanupTempDir(dirPath: string) {
  if (!existsSync(dirPath)) return;
  rmSync(dirPath, { recursive: true, force: true });
}
export function createTempFile(content: string, fileName = 'test-dummy.txt') {
  const dirPath = mkdtempSync(join(tmpdir(), 'verify-cli-'));
  const filePath = join(dirPath, fileName);
  writeFileSync(filePath, content);
  return { dirPath, filePath };
}
