import { ALGORITHMS } from './constants.js';

export function showHelp(): never {
  const availableAlgosStr = ALGORITHMS.join(', ');
  // prettier-ignore
  const helpText =
`verify-integrity v${__CLI_VERSION__}

Usage: verify-integrity [options] <file> <expected_hash>

Options:
  -a, --algorithm <algo>  Hashing algorithm to use (choices: ${availableAlgosStr}, default: ${ALGORITHMS[0]})
  -b, --buffer <size>     Stream buffer size in MiB (positive integer, default: 4)
  -p, --partial           Allow partial match of the expected hash prefix (min 4 chars)
  -q, --quiet             Suppress all output
      --no-color          Disable colored output
  -V, --version           Output version
  -h, --help              Display help`;

  console.log(helpText);
  process.exit(0);
}
