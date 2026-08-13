---
title: Transport Specification
---

# Transport Specification

Braid currently supports SSE (Server-Sent Events) as the transport format.

## SSE Format

Each Braid command is sent as a single `data: <json>` line terminated by `\n\n`. The command stream ends with `data: [DONE]`.

```text
data: {"type":"render","component":"SearchBox","params":{"placeholder":"Search projects"}}

data: {"type":"update","widgetId":"widget-1","params":{"value":"Mercury"}}

data: [DONE]
```

## Stream Parsing Behavior

`consumeBraidStream()` parses SSE streams with the following rules:

1. Reads line by line, ignoring empty lines.
2. Only lines starting with `data:` are processed; other lines are silently skipped.
3. Whitespace after `data:` is trimmed.
4. Encountering `[DONE]` returns immediately — no further data is processed.
5. Each `data:` line payload is parsed via `JSON.parse()`:
   - Success → command structure is validated → dispatched if valid, exposed via `onError` if invalid
   - Failure → exposed via `onError` with the raw payload
6. After the stream ends, any remaining content in the buffer is exposed via `onError` as a "trailing partial SSE frame."

## Buffer Handling

The parser maintains an internal line buffer to handle `data:` lines split across multiple chunks:

```ts
let buffer = '';
// Appended on each chunk arrival, split by line
buffer += chunk;
const lines = buffer.split(/\r?\n/);
buffer = lines.pop() ?? ''; // Last segment may be incomplete — kept in buffer
```

## WebSocket and HTTP Polling

WebSocket and HTTP Polling are planned transport options but have no runtime consumption logic yet. The Runtime itself does not care how bytes arrive — as long as valid commands reach the Runtime API.

## References

- `packages/braid/src/runtime/vue/stream.ts` — SSE stream parser implementation
- `packages/braid/src/runtime/vue/adapter.ts` — `dispatch()` and `handleError()` interfaces
