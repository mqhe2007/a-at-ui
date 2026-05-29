# A@UI

[中文](./README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/a-at-ui)](https://www.npmjs.com/package/a-at-ui)
[![release](https://img.shields.io/github/v/tag/mqhe2007/a-at-ui?sort=semver&label=release)](https://github.com/mqhe2007/a-at-ui/releases)
[![license](https://img.shields.io/github/license/mqhe2007/a-at-ui)](https://github.com/mqhe2007/a-at-ui/blob/main/LICENSE)
[![CI](https://github.com/mqhe2007/a-at-ui/actions/workflows/test.yml/badge.svg)](https://github.com/mqhe2007/a-at-ui/actions/workflows/test.yml)
[![skills.sh](https://skills.sh/b/mqhe2007/a-at-ui)](https://skills.sh/mqhe2007/a-at-ui)
[![docs](https://img.shields.io/badge/docs-online-0A7C66)](https://a-at-ui.mengqinghe.com)

A@UI is a protocol specification and frontend runtime for AI agent-driven interfaces. Any backend only needs to emit a JSON command stream that follows the protocol; the frontend registers manifests and components, then consumes the stream to render the UI.

Documentation site: <https://a-at-ui.mengqinghe.com>

## Install

Install the frontend runtime package:

```bash
npm install a-at-ui
```

## Install the Skill

Install the A@UI skill with the skills CLI:

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui
```

## What This Repository Contains

- Protocol source of truth: SKILL definition, prompt snippets, JSON Schema assets, and reference docs
- Frontend runtime: the `a-at-ui` package entry and `a-at-ui/runtime/**` subpaths
- Backend integration model: any language can emit A@UI command streams directly without a backend SDK

## Contributing

Contributions are welcome, including bug reports, feature proposals, documentation improvements, and pull requests.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

### Local Development

```bash
# install dependencies
bun install

# start the docs site
bun website:dev

# run tests
bun run test

# validate JSON Schema files
bun run schema:test
```

### Repository Layout

| Directory           | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `packages/a-at-ui/` | Core frontend runtime package            |
| `apps/website/`     | Documentation site built with Nuxt       |
| `skills/a-at-ui/`   | Agent skill definition and schema assets |

### Commit Convention

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), for example:

```text
feat(runtime): add streaming render support for the frontend adapter
fix(schema): correct a required field in the commands schema
docs: expand the backend integration guide
```

### Pull Request Flow

1. Fork the repository and create a feature branch from `main`.
2. Implement your changes and make sure `bun run test` and `bun run schema:test` both pass.
3. Open a pull request that explains the motivation and impact of the change.

## License

MIT
