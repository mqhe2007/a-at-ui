---
title: Node.js Backend Integration
---

# Node.js Backend Integration

The Braid backend principle is one sentence: consume the protocol, not an SDK.

## Constraints

- Do not install any Braid backend SDK
- Only output JSON commands that conform to `assets/commands.schema.json`
- For SSE, write one `data: <json>` line per command, ending with `data: [DONE]`

## Minimal SSE Example

```text
data: {"type":"render","component":"PersonalProfileCard","params":{"name":"Alex","title":"Content Strategist"}}

data: [DONE]
```

## Example: Native http Module

```js
import http from 'node:http'

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const commands = [
    { type: 'render', component: 'PersonalProfileCard', params: { name: 'Alex', title: 'Content Strategist' } },
    { type: 'render', component: 'ArticleList', params: { items: [] } },
  ]

  for (const cmd of commands) {
    res.write(`data: ${JSON.stringify(cmd)}\n\n`)
  }

  res.write('data: [DONE]\n\n')
  res.end()
}).listen(3000)
```

## Implementation Steps

1. Decide which `render`, `update`, and `destroy` commands to emit based on your business logic.
2. Make sure each `component` name matches the frontend manifest/registry.
3. Keep `params` as plain JSON data only.
4. Wrap each command line with `data:` and terminate with `\n\n`.
5. End the stream with `data: [DONE]\n\n`.

## Common Mistakes

- Attempting to create or depend on `widgetId` on the backend
- Including functions, `Date`, `Map`, or other non-serializable objects in commands
- Using unregistered component names
- Emitting Markdown or log text that pollutes the SSE data stream
