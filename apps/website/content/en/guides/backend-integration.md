---
title: Backend Integration
---

# Backend Integration

The Braid backend principle is one sentence: consume the protocol, not an SDK.

## Mandatory Constraints

- Do not install any Braid backend SDK
- Only output JSON commands that conform to `assets/commands.schema.json`
- When using SSE, write one `data: <json>` line per command, ending with `data: [DONE]`

## Minimal SSE Example

```text
data: {"type":"render","component":"PersonalProfileCard","params":{"name":"Alex","title":"Content Strategist"}}

data: [DONE]

```

## Node.js Example

Use the native `http` module, return `text/event-stream`, and build the render command array based on the incoming request. For a complete backend integration example, see [mengqinghe.com](https://mengqinghe.com).

## Implementation Steps

1. Decide which `render`, `update`, and `destroy` commands to emit based on your business logic.
2. Make sure each `component` name matches the frontend manifest/registry.
3. Keep `params` as plain JSON data only.
4. For SSE transport, wrap each command with the `data:` prefix.
5. End the stream with `[DONE]`.

## Common Mistakes

- Attempting to create or depend on `widgetId` on the backend
- Including functions, `Date`, `Map`, or other non-serializable objects in commands
- Using unregistered component names
- Emitting Markdown or log text that pollutes the SSE data stream
