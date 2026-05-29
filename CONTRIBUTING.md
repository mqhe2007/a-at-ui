# Contributing

## Development setup

```bash
bun install
```

## Local commands

```bash
# Build all packages
bun run build

# Run package tests
bun run test

# Validate JSON Schema files
bun run schema:test

# Start the documentation website
bun website:dev
```

## Pull requests

1. Create a branch from `main`.
2. Keep changes focused and update docs when behavior changes.
3. Run the relevant validation commands before opening a PR.
4. Use Conventional Commits in commit messages when practical.

## Release notes

Document user-visible changes in [CHANGELOG.md](./CHANGELOG.md).
