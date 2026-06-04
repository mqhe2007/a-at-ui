---
title: Error Reference
---

# Error Reference

The A@UI Runtime produces errors in the following scenarios. All errors are exposed through the `onError` callback with a `source` label and context information.

## Error Types

### Initialization Errors

| Scenario | Error Message | Trigger |
|----------|--------------|---------|
| Plugin not installed | `useAAtUIAdapter() must be called after installing the A@UI plugin` | Calling `useAAtUIAdapter()` without installing the plugin |
| Missing global registration | `Component "X" not found. Register it globally...` | Plugin install with component name not in global registry and no explicit map |
| Missing manifest component | `Manifest component "X" has no matching Vue component` | `WidgetManager` init with a manifest-declared component having no Vue implementation |
| Mount target not found | `Mount target not found: "selector"` | Passed CSS selector does not match any element in the DOM |

### Command Validation Errors

| Scenario | Error Message | source |
|----------|--------------|--------|
| JSON parse failure | Native `JSON.parse` error | `stream` |
| Invalid command structure | `Invalid command payload.` | `stream` |

### Dispatch Errors

| Scenario | Error Message | source |
|----------|--------------|--------|
| Unknown component | `Unknown component: "X"` | `dispatch` |
| Component does not support render | `Component does not support render: "X"` | `dispatch` |
| Component does not support update | `Component does not support update: "X"` | `dispatch` |
| Component does not support destroy | `Component does not support destroy: "X"` | `dispatch` |
| Unsupported command type | `Unsupported command type: "X"` | `dispatch` |

### Stream Protocol Errors

| Scenario | Behavior | source |
|----------|----------|--------|
| Trailing partial SSE frame | `Trailing partial SSE frame.` exposed via `onError` | `stream` |
| Event payload not serializable | `Event payload must be JSON-serializable` thrown | `dispatch` |

## Warnings (Non-Error)

| Scenario | Behavior |
|----------|----------|
| Unknown widget for update | `console.warn`, skip command |
| Unknown widget for destroy | `console.warn`, treat as idempotent no-op |

## Error Context Structure

Context object exposed via the `onError(error, context)` callback:

```ts
interface AAtUIAdapterErrorContext {
  source: 'stream' | 'dispatch' | 'config';
  raw?: string;       // Raw SSE payload (when source is "stream")
  command?: unknown;   // Parsed command object (when source is "dispatch")
}
```

## References

- `packages/a-at-ui/src/runtime/vue/adapter.ts` — `AAtUIAdapterErrorContext` type definition
- `packages/a-at-ui/src/runtime/vue/widget-manager.ts` — dispatch error implementation
- `packages/a-at-ui/src/runtime/vue/stream.ts` — stream error implementation
