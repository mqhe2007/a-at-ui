---
title: Command Protocol
---

# Command Protocol

A@UI currently defines three commands: `render`, `update`, and `destroy`.

## render

Creates and renders a component instance.

```json
{
  "type": "render",
  "component": "SearchBox",
  "params": {
    "placeholder": "Search projects"
  }
}
```

Constraints:

- Required: `type`, `component`
- Optional: `params`
- Forbidden: `widgetId`

## update

Performs a shallow merge update on an existing component instance.

```json
{
  "type": "update",
  "widgetId": "widget-1",
  "params": {
    "value": "Mercury"
  }
}
```

Constraints:

- Required: `type`, `widgetId`, `params`
- `params` must be an object

## destroy

Destroys an existing component instance.

```json
{
  "type": "destroy",
  "widgetId": "widget-1"
}
```

Constraints:

- Required: `type`, `widgetId`
- No extra fields allowed

## Transport Format

The first standard transport example is SSE:

```text
data: {"type":"render","component":"SearchBox","params":{"placeholder":"Search projects"}}

data: [DONE]

```

The canonical source of truth is `assets/commands.schema.json`.
