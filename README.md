# verify-integrity

> A modern CLI tool to easily generate and verify file hashes.

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

| Argument        | Description                                 |
| --------------- | ------------------------------------------- |
| `file`          | Path to the file you want to verify         |
| `expected_hash` | The expected hash string to compare against |

### Options

| Option                    | Description                                                           | Default  |
| ------------------------- | --------------------------------------------------------------------- | -------- |
| `-a, --algorithm <value>` | Hashing algorithm to use                                              | `sha256` |
| `-p, --partial`           | Allow a partial match — checks if the expected value is a hash prefix | `false`  |
| `-q, --quiet`             | Suppress all visual output                                            | `false`  |
| `-V, --version`           | Output the version number                                             |          |
| `-h, --help`              | Display help for command                                              |          |

## Examples

**Basic SHA-256 verification (default):**

```bash
verify-integrity ./myfile.zip abc123def456...
```

**Specify a different algorithm:**

```bash
verify-integrity -a sha512 ./myfile.tar.gz <expected_sha512_hash>
```

**Use MD5:**

```bash
verify-integrity -a md5 ./archive.zip <expected_md5_hash>
```

**Partial hash match** (useful when you only have a short hash prefix):

```bash
verify-integrity -p ./myfile.zip abc123
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

- Node.js `>= 20`

## License

This software is licensed under the MIT License. See the [LICENSE](/LICENSE) for more info.
