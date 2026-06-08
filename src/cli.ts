#!/usr/bin/env node
import { generateHash } from './generateHash.js';
import { doHashesMatch } from './doHashesMatch.js';
import { formatHashDiff } from './formatHashDiff.js';
import {
  ALGORITHMS,
  HASHES,
  icons,
  MIN_HASH_ERROR_LENGTH,
  MIN_HASH_WARN_LENGTH,
  WEAK_ALGORITHMS,
} from './constants.js';
import { dynamicMessages, staticMessages } from './messages.js';
import { createColors } from './colors.js';
import { parseArguments } from './parseArguments.js';
import { showHelp } from './showHelp.js';
import { createLogger } from './logger.js';
import type { Algorithm, Logger } from './types.js';

async function main() {
  let logger: Logger = createLogger(false, false);
  let isQuiet = false;

  try {
    if (process.argv.length === 2) showHelp();
    const output = parseArguments();
    const { algorithm, bufferSize, expectedHash, filePath, help, noColor, partial, quiet, version } = output;
    isQuiet = quiet;
    logger = createLogger(quiet, noColor);
    const colors = createColors(noColor);

    if (help) showHelp();

    if (version) {
      console.log(`v${__CLI_VERSION__}`);
      process.exit(0);
    }

    // validate inputs
    if (!expectedHash || !filePath) logger.fatal(staticMessages.missingFileOrHash);
    else if (!/^[0-9a-f]+$/i.test(expectedHash)) logger.fatal(staticMessages.invalidExpectedHash);
    else if (expectedHash.length < MIN_HASH_ERROR_LENGTH && partial)
      logger.fatal(staticMessages.partialHashTooSmall);
    else if (!/^[1-9]\d*$/.test(bufferSize)) logger.fatal(dynamicMessages.bufferSizeNotInt(bufferSize));
    else if (!algorithm) logger.fatal(staticMessages.noSupportedAlg);
    else if (!ALGORITHMS.includes(algorithm as Algorithm)) logger.fatal(dynamicMessages.unsupportedAlg(algorithm));
    else if (expectedHash.length !== HASHES[algorithm as Algorithm].hexLength && !partial)
      logger.fatal(dynamicMessages.hashLengthMismatch(algorithm, expectedHash.length.toString(10)));

    const generatedHash = await generateHash(filePath, algorithm, parseInt(bufferSize, 10), () => {
      if (expectedHash.length < MIN_HASH_WARN_LENGTH && partial) logger.warn(staticMessages.shortHashWarning);
      if (WEAK_ALGORITHMS.includes(algorithm as Algorithm)) logger.warn(dynamicMessages.weakAlgo(algorithm));
      setTimeout(() => logger.info('Generating hash...'), 500);
    });

    const hashedMatched = doHashesMatch(expectedHash, generatedHash, partial);

    if (hashedMatched) {
      logger.log(`${colors.greenBold(`${icons.success} ${staticMessages.hashesMatch}`)}`);
      logger.log(`${colors.cyanBold('   Algorithm:')} ${colors.cyanBold(algorithm.toUpperCase())}`);
      logger.log(`${colors.cyanBold('   Generated: ')}${colors.greenBold(generatedHash)}`);
      process.exit(0);
    } else {
      const { expectedHighlighted, generatedHighlighted } = formatHashDiff(expectedHash, generatedHash, noColor);
      logger.log(`${colors.redBold(`${icons.error} ${staticMessages.hashesDidNotMatch}`)}`);
      logger.log(`${colors.cyanBold('   Algorithm:')} ${colors.cyanBold(algorithm.toUpperCase())}`);
      logger.log(`${colors.cyanBold('   Expected:')}  ${expectedHighlighted}`);
      logger.log(`${colors.cyanBold('   Generated:')} ${generatedHighlighted}`);
      process.exit(1);
    }
  } catch (e) {
    const err = e as Error & { code?: string };
    if (err?.code?.startsWith('ERR_PARSE_ARGS_') || e instanceof Error) {
      logger.fatal(err.message);
    } else {
      if (!isQuiet) console.error(e);
      process.exit(1);
    }
  }
}

main();
