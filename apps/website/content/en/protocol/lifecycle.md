---
title: Lifecycle
---

# Lifecycle & Error Strategy

## Lifecycle

1. The frontend initializes the adapter using the manifest, registry, and mount target.
2. The runtime validates that the manifest matches the registry.
3. The backend emits the command stream, and the frontend consumes it sequentially.
4. `render` creates a widget instance and generates a `widgetId`.
5. `update` performs a shallow merge on the widget's props.
6. `destroy` unmounts the component and cleans up internal state.

## Error Strategy

- Mount target not found: throw an error
- Unregistered component: throw an error
- Manifest–registry mismatch: throw an error at initialization
- `update` on an unknown widget: warn and skip
- `destroy` on an unknown widget: warn and treat as an idempotent no-op
- Invalid JSON: exposed through the error channel, never silently swallowed
- Schema-invalid command: exposed through the error channel, no speculative fixes

## Event Wrapping

Components are only responsible for emitting `type` and `payload`. The runtime automatically appends:

- `widgetId`
- `timestamp`

For more details, see `references/lifecycle.md`.
