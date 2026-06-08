# verify-integrity

> A modern, zero-dependency CLI tool to easily verify file hashes.

## Installation

You can run the tool directly using `npx` (no installation required):

```bash
npx verify-integrity <file> <expected_hash>
```

Or, install it globally to use it anywhere on your system:

```bash
npm install -g verify-integrity
```

## Usage

```bash
verify-integrity [options] <file> <expected_hash>
```

### Arguments

| Argument        | Description                                                     |
| --------------- | --------------------------------------------------------------- |
| `file`          | Path to the file you want to verify. Use `-` to read from stdin |
| `expected_hash` | The expected hash string to compare against                     |

### Options

| Option                   | Description                                                                         | Default  |
| ------------------------ | ----------------------------------------------------------------------------------- | -------- |
| `-a, --algorithm <algo>` | Hashing algorithm to use                                                            | `sha256` |
| `-b, --buffer <size>`    | Read buffer size in MiB (integer)                                                   | `4`      |
| `-p, --partial`          | Allow a partial match — checks if the expected value is a hash prefix (min 4 chars) | `false`  |
| `-q, --quiet`            | Suppress all output                                                                 | `false`  |
| `--no-color`             | Disable colored output                                                              | `false`  |
| `-V, --version`          | Output the version number                                                           |          |
| `-h, --help`             | Display help for command                                                            |          |

## Examples

**Basic SHA-256 verification (default):**

```bash
verify-integrity ./myfile.zip b94d27b9934d3e08...
```

**Specifying a different algorithm:**

```bash
verify-integrity -a sha512 ./myfile.tar.gz 9b71d224bd62f378...
```

**Partial hash matching** (useful when you only have a short hash prefix):

```bash
verify-integrity -p ./myfile.zip b94d27b9
```

**Reading from stdin:**

```bash
curl -sL https://example.com/file.zip | verify-integrity - b94d27b9934d3e08...
```

**Large file with increased buffer size** (reduces I/O overhead for multi-GB files):

```bash
verify-integrity -b 8 ./large-file.zip b94d27b9934d3e08...
```

**Memory-constrained environment with reduced buffer size:**

```bash
verify-integrity -b 1 ./myfile.zip b94d27b9934d3e08...
```

## Supported Algorithms

The CLI supports the following standard algorithms (dynamically verified against your system's OpenSSL environment):

| Algorithm                | Security | Best For...                                                       |
| :----------------------- | :------- | :---------------------------------------------------------------- |
| **`sha256`** _(Default)_ | Secure   | The modern standard. Best for general use and secure downloads.   |
| **`sha512`**             | Maximum  | High-security environments or sensitive data verification.        |
| **`md5`**                | Broken   | Legacy systems or fast checks for accidental download corruption. |
| **`sha1`**               | Weak     | Legacy enterprise software and old documentation.                 |

## Requirements

- Node.js `>=18.11.0`

## License

This software is licensed under the MIT License. See the [LICENSE](/LICENSE) for more info.
