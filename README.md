# A@UI

[中文](./README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/a-at-ui)](https://www.npmjs.com/package/a-at-ui)
[![release](https://img.shields.io/github/v/tag/mqhe2007/a-at-ui?sort=semver&label=release)](https://github.com/mqhe2007/a-at-ui/releases)
[![license](https://img.shields.io/github/license/mqhe2007/a-at-ui)](https://github.com/mqhe2007/a-at-ui/blob/main/LICENSE)
[![CI](https://github.com/mqhe2007/a-at-ui/actions/workflows/test.yml/badge.svg)](https://github.com/mqhe2007/a-at-ui/actions/workflows/test.yml)
[![skills.sh](https://skills.sh/b/mqhe2007/a-at-ui)](https://skills.sh/mqhe2007/a-at-ui)
[![docs](https://img.shields.io/badge/docs-online-0A7C66)](https://a-at-ui.mengqinghe.com)

**A protocol specification and lightweight frontend runtime for AI Agent-driven interfaces.**

Any backend emits a JSON command stream following the protocol. The frontend registers manifests and components, then consumes the stream to render real UI. No backend SDK, no tight coupling, no arbitrary code execution.

> [!WARNING]
> A@UI is under active development and should be treated as unstable until a stable release. Protocol details, runtime APIs, manifest shapes, and command semantics may change.
>
> If adopting in production: pin an exact version, validate manifests against the schema assets in this repository, read release notes before upgrading, and keep graceful fallbacks for unknown commands or rendering behavior.

---

<p align="center">
  <img width="1138" height="574" alt="A@UI Demo" src="https://github.com/user-attachments/assets/8076afec-584a-4bd5-8704-7b8cccffddd7" />
</p>
---

## Why A@UI

Building AI-driven interfaces today means either:

- **Giving the agent full DOM/Canvas access** — powerful but unsafe and unpredictable.
- **Using a document-generation approach** — rich text, not real interactive components.
- **Adopting a heavy protocol** — multi-component catalogs, transport negotiation, schema registries on both ends.

A@UI takes a different route: **three commands, one JSON stream, zero backend dependencies.**

```text
render   → Create a component instance with initial data
update   → Patch its props in-place
destroy  → Remove it cleanly
```

The backend simply emits these commands over any transport (SSE, WebSocket, HTTP Polling). The frontend runtime does the rest — widget lifecycle, DOM management, event wiring. No backend SDK, no catalog registration, no extra metadata.

## How It Works

```
┌─────────────┐     render/update/destroy      ┌───────────────┐
│  AI Agent   │ ────────── JSON ──────────▶    │  A@UI Runtime │
│  (any lang) │                                 │  (frontend)   │
└─────────────┘                                 └───────┬───────┘
                                                         │
                                                 props / events
                                                         │
                                                  ┌──────▼──────┐
                                                  │  UI Widgets │
                                                  │  (Vue, etc.)│
                                                  └─────────────┘
```

- **Transport-agnostic**: WebSocket, SSE, or HTTP Polling — the protocol doesn't care.
- **Language-agnostic backend**: Python, Go, Node.js, Rust — just emit valid JSON.
- **Framework-flexible frontend**: Use the official Vue adapter, or extend to other stacks.

## Quick Start

### 1. Install

```bash
npm install a-at-ui
```

### 2. Register components and install the plugin

```ts
import { createApp } from 'vue'
import { createAAtUIPlugin } from 'a-at-ui/runtime/vue'
import manifest from './a-at-ui.manifest.json'
import SearchBox from './SearchBox.vue'
import ArticleList from './ArticleList.vue'

const app = createApp(App)
app.component('SearchBox', SearchBox)
app.component('ArticleList', ArticleList)
app.use(createAAtUIPlugin({ manifest }))
app.mount('#app')
```

### 3. Emit commands from the backend

```js
import http from 'node:http'

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const commands = [
    { type: 'render', component: 'SearchBox', params: { placeholder: 'Search projects' } },
    { type: 'render', component: 'ArticleList', params: { items: [] } },
  ]

  for (const cmd of commands) {
    res.write(`data: ${JSON.stringify(cmd)}\n\n`)
  }

  res.write('data: [DONE]\n\n')
  res.end()
}).listen(3000)
```

That's it. No backend SDK, no transport negotiation, no catalog registration.

## Full Documentation

Documentation site: [a-at-ui.mengqinghe.com](https://a-at-ui.mengqinghe.com)

- [Vue Frontend Guide](https://a-at-ui.mengqinghe.com/docs/guides/frontend-vue)
- [Node.js Backend Guide](https://a-at-ui.mengqinghe.com/docs/guides/backend-nodejs)
- [Component Manifest](https://a-at-ui.mengqinghe.com/docs/guides/component-manifest)
- [Command Protocol](https://a-at-ui.mengqinghe.com/docs/protocol/commands)
- [Event Protocol](https://a-at-ui.mengqinghe.com/docs/protocol/events)
- [Lifecycle & Error Strategy](https://a-at-ui.mengqinghe.com/docs/protocol/lifecycle)

## Agent Skill

A@UI ships three installable skills for different roles:

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui-manifest
npx skills add mqhe2007/a-at-ui --skill a-at-ui-setup
npx skills add mqhe2007/a-at-ui --skill a-at-ui-protocol
```

- `a-at-ui-manifest` — for component library authors creating manifests
- `a-at-ui-setup` — for developers wiring the frontend runtime
- `a-at-ui-protocol` — for backend agents emitting protocol-compliant commands

## Comparison with A2UI

[A2UI](https://a2ui.org/) is a protocol for agent-driven interfaces backed by Google. Both projects share similar high-level goals. The key differences:

| Dimension | A@UI | A2UI |
|-----------|------|------|
| **Backend surface** | Zero dependencies — any language emits plain JSON | Requires catalog setup, transport negotiation, message routing |
| **Command surface** | 3 commands: render, update, destroy | Multiple message types: surfaces, components, catalogs, actions, data binding |
| **Frontend adapters** | Lightweight runtime adapter (Vue), designed for extensibility | Full renderers (Angular, Flutter, Lit, React) |
| **Transport** | Transport-agnostic — SSE, WebSocket, HTTP Polling | A2A extension, plus basic SSE |
| **Governance** | Open source, individual maintainer | Google + CopilotKit + community |
| **License** | MIT | Apache 2.0 |
| **Stability** | Pre-stable (0.x) | v0.8 stable, v0.9 draft |

A@UI prioritizes **radical simplicity on the backend side** — any service that can emit JSON can drive the UI. If you want a richer protocol with formal transport negotiation and multiple renderers out of the box, A2UI may be a better fit.

## Repository Contents

| Directory | Purpose |
|-----------|---------|
| `packages/a-at-ui/` | Core frontend runtime package (npm) |
| `apps/website/` | Documentation site (Nuxt) |
| `skills/a-at-ui/` | Agent skill definitions and JSON Schema assets |

## Live Example

A production site built with the A@UI architecture: [mengqinghe.com](https://mengqinghe.com)

## Contributing

Contributions are welcome — bug reports, feature proposals, documentation improvements, and pull requests.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

```bash
# install dependencies
bun install
bun website:dev    # start docs site
bun run test       # run tests
bun run schema:test  # validate JSON Schema
```

### Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(runtime): add streaming render support for the frontend adapter
fix(schema): correct a required field in the commands schema
docs: expand the backend integration guide
```

## License

MIT
