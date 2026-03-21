#!/usr/bin/env node

import { Command, Option } from 'commander';
import { generateHash } from './generateHash.js';
import path from 'node:path';
import { getHashes } from 'node:crypto';
import ora, { type Ora } from 'ora';
import chalk from 'chalk';
import { doHashesMatch } from './doHashesMatch.js';
import { formatHashDiff } from './formatHashDiff.js';
import { messages, icons } from './constants.js';
import packageData from '../package.json' with { type: 'json' };
import type { ProgramOptions } from './types.js';

const program = new Command(packageData.name);

const availableHashes = getHashes();
const algorithms: string[] = ['sha256', 'sha512', 'md5', 'sha1'].filter((a) =>
  availableHashes.includes(a)
);

program
  .arguments('<file> <expected_hash>')
  .addOption(
    new Option('-a, --algorithm <value>', 'specify the hashing algorithm to use')
      .choices(algorithms)
      .default(algorithms[0])
  )
  .option('-p, --partial', 'allow partial match of the expected hash prefix', false)
  .option('-q, --quiet', 'suppress all visual output', false)
  .version(packageData.version);

async function main() {
  program.parse(process.argv);
  const [filePath, expectedHash] = program.args as [string, string];
  const { algorithm, partial, quiet } = program.opts<ProgramOptions>();

  if (expectedHash.length < 8 && partial && !quiet) {
    console.warn(chalk.yellow(`${icons.warning} ${messages.shortHashWarning}`));
  }

  let spinner: Ora | null = null;

  if (!quiet) {
    spinner = ora({
      text: chalk.cyan(`Generating hash using ${algorithm}`),
      color: 'cyan',
    }).start();
  }

  try {
    const absoluteFilePath = path.resolve(process.cwd(), filePath || '');
    const generatedHash = await generateHash(absoluteFilePath, algorithm);
    if (!quiet) spinner?.stop();
    const hashedMatched = doHashesMatch(expectedHash, generatedHash, partial);
    if (hashedMatched) {
      if (quiet) process.exit(0);
      console.log(`${chalk.bold.green(`\n${icons.success} ${messages.hashesMatch}`)}`);
      console.log(`${chalk.green('Generated hash: ')}${chalk.bold.green(generatedHash)}`);
      process.exit(0);
    } else {
      if (quiet) process.exit(1);
      const { expectedHighlighted, generatedHighlighted } = formatHashDiff(
        expectedHash,
        generatedHash
      );
      console.log(`${chalk.bold.red(`\n${icons.error} ${messages.hashesDidNotMatch}`)}`);
      console.log(`${chalk.green('   Expected:')}  ${expectedHighlighted}`);
      console.log(`${chalk.red('   Generated:')} ${generatedHighlighted}`);
      process.exit(1);
    }
  } catch (e) {
    if (quiet) process.exit(1);
    spinner?.stop();
    console.error(chalk.red(`\n${icons.error} Error: ${e instanceof Error ? e.message : e}`));
    process.exit(1);
  }
}

main();
