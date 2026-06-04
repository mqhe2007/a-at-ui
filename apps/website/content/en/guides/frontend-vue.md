---
title: Vue Frontend Integration
---

# Vue Frontend Integration

This guide explains how to integrate `a-at-ui/runtime/vue` into a Vue application.

## Prerequisites

- An existing Vue 3 application
- A component library that provides `a-at-ui.manifest.json`
- Vue component implementations for every component name declared in the manifest

## Installation

Frontend integration must use the official npm runtime — do not implement the A@UI runtime yourself:

```bash
npm install a-at-ui vue
```

## Integration Steps

1. Globally register the component library using Vue's standard `app.component()`.
2. Install the A@UI plugin `createAAtUIPlugin`.
3. In component setup, call `useAAtUIAdapter()` to obtain the `createAdapter` factory.
4. Call `createAdapter()` to create an adapter and consume the command stream.

## Recommended: Plugin Mode

Components are registered globally via Vue, and the A@UI plugin discovers them automatically — no manual component map needed.

```ts
// main.ts
import { createApp } from 'vue'
import { createAAtUIPlugin } from 'a-at-ui/runtime/vue'
import manifest from './a-at-ui.manifest.json'
import ArticleList from './ArticleList.vue'
import PersonalProfileCard from './PersonalProfileCard.vue'

const app = createApp(App)

// 1. Register the component library globally using standard Vue APIs
app.component('PersonalProfileCard', PersonalProfileCard)
app.component('ArticleList', ArticleList)

// 2. Install the A@UI plugin (auto-discovers manifest-declared components from the global registry)
app.use(createAAtUIPlugin({ manifest }))

app.mount('#app')
```

```ts
// Usage inside a component
import { useAAtUIAdapter } from 'a-at-ui/runtime/vue'

const { createAdapter } = useAAtUIAdapter()

const adapter = createAdapter({
  mountTarget: '#widget-stage',
  onEvent(event) { console.log(event) },
  onError(error, context) { console.error(context.source, error.message) },
})

await consumeAAtUIStream(response.body, adapter)
```

## Explicit Component Map (Optional)

If you prefer not to use global registration, pass an explicit `components` map in the plugin options:

```ts
app.use(createAAtUIPlugin({
  manifest,
  components: {
    PersonalProfileCard,
    ArticleList,
  },
}))
```

**Resolution priority**: explicit `components` map > `app.component()` global registration.

## Runtime Behavior

- `render`: creates a new widget and generates a `widgetId`
- `update`: shallow-merges updated props
- `destroy`: unmounts the component and releases its DOM
- Component events: the runtime automatically appends `widgetId` and `timestamp`

This behavior is provided by `a-at-ui/runtime/vue`. Do not re-implement it in your application code.

## Live Example

See [mengqinghe.com](https://mengqinghe.com) for a complete production example built with the A@UI architecture.
