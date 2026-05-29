---
name: a-at-ui-setup
description: "Use when setting up A@UI in a project: installing the npm package, wiring the frontend runtime, integrating framework adapters, or configuring the component manifest. Targets AI coding tools like Claude Code, Codex, and VS Code. Do NOT use for emitting A@UI commands from a backend agent — use a-at-ui-protocol for that."
metadata:
  author: a-at-ui
  version: "0.1.0"
---

# A@UI Setup Skill

## What This Skill Does

This skill guides AI coding tools (Claude Code, Codex, VS Code Copilot, etc.) to install, integrate, and configure A@UI in a developer's project. It covers frontend runtime wiring, framework adapter selection, and manifest setup.

Use this skill when the developer wants to:

- add A@UI to an existing frontend project
- install the official `a-at-ui` npm package
- wire the frontend runtime for a specific framework (Vue, React in future)
- set up a component manifest (`a-at-ui.manifest.json`)
- register frontend components so the runtime can render them
- connect a backend command stream to the frontend runtime

Do not use this skill for:

- emitting A@UI commands from a backend agent (use `a-at-ui-protocol`)
- defining the command protocol itself (use `a-at-ui-protocol`)
- component business logic or data fetching

## Critical Rule

**Never implement an A@UI runtime from scratch.** Always install and use the official npm package:

```bash
npm install a-at-ui
```

The package provides framework-specific adapters, command stream parsers, widget lifecycle management, and event forwarding. Reimplementing any of these in the business app is forbidden.

Only build a custom runtime adapter if the developer explicitly asks for a new framework adapter that doesn't exist yet.

## Supported Framework Adapters

| Framework | Adapter Entry | Status |
|-----------|--------------|--------|
| Vue 3 | `a-at-ui/runtime/vue` | Stable |

## Vue 3 Integration

### 1. Install

```bash
npm install a-at-ui vue
```

### 2. Recommended: Plugin Mode

Register components globally with Vue, then install the A@UI plugin. The plugin auto-discovers registered components that match the manifest.

```ts
// main.ts
import { createApp } from 'vue'
import { createAAtUIPlugin } from 'a-at-ui/runtime/vue'
import manifest from './a-at-ui.manifest.json'
import ArticleList from './components/ArticleList.vue'
import PersonalProfileCard from './components/PersonalProfileCard.vue'

const app = createApp(App)

// 1. Register components globally (standard Vue pattern)
app.component('PersonalProfileCard', PersonalProfileCard)
app.component('ArticleList', ArticleList)

// 2. Install A@UI plugin — auto-discovers manifest components from global registry
app.use(createAAtUIPlugin({ manifest }))

app.mount('#app')
```

Alternative — explicit component mapping:

```ts
app.use(createAAtUIPlugin({
  manifest,
  components: {
    PersonalProfileCard,
    ArticleList,
  },
}))
```

### 3. Consume Command Stream

Inside any component, get the adapter factory and consume the backend SSE stream:

```ts
import { useAAtUIAdapter, consumeAAtUIStream } from 'a-at-ui/runtime/vue'

const { createAdapter } = useAAtUIAdapter()

const adapter = createAdapter({
  mountTarget: '#widget-stage',
  onEvent(event) {
    // event = { type, widgetId, payload, timestamp }
    console.log('User interaction:', event)
  },
  onError(error, context) {
    console.error(context.source, error.message)
  },
})

// response.body comes from fetch() or similar
await consumeAAtUIStream(response.body, adapter)
```

### 4. Manifest Setup

The manifest (`a-at-ui.manifest.json`) declares what components are available. Import it as JSON:

```ts
import manifest from './a-at-ui.manifest.json'
```

Every component in the manifest must have a corresponding registered frontend component with the same name.

## Integration Checklist

After setup, verify:

1. `a-at-ui` is installed in `node_modules`
2. The manifest is imported and passed to `createAAtUIPlugin`
3. All manifest component names have matching registered Vue components
4. `createAAtUIPlugin` is called via `app.use()` before `app.mount()`
5. `consumeAAtUIStream` is called with a valid `ReadableStream` and adapter
6. `mountTarget` points to an existing DOM element
7. Event and error callbacks are wired if needed

## Common Pitfalls

- **Forgetting `app.use(plugin)`**: The plugin must be installed before mount, otherwise components in the manifest won't be discovered.
- **Component name mismatch**: The `name` in manifest must exactly match `app.component('Name', ...)`.
- **Importing the wrong entry**: Always import from `a-at-ui/runtime/vue`, not from `a-at-ui` directly.
- **Self-implementing the runtime**: The npm package already handles widget ID generation, shallow merging, mounting, and cleanup. Don't reinvent these.
- **Missing `mountTarget`**: The CSS selector must resolve to an existing DOM element at the time `createAdapter` is called.

## References

- [Frontend Vue Guide](https://a-at-ui.mengqinghe.com/zh/guides/frontend-vue)
- [A@UI Protocol Documentation](https://a-at-ui.mengqinghe.com/zh/protocol/commands)
