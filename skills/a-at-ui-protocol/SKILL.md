---
name: a-at-ui-protocol
description: "Use when an AI agent/SDK needs to emit A@UI render/update/destroy command streams to drive frontend widgets. Injects the A@UI protocol rules, command shapes, streaming format, and validation constraints into the agent's system prompt. Backend-only: no frontend runtime setup."
metadata:
  author: a-at-ui
  version: "0.2.0"
---

# A@UI Protocol Skill

## What This Skill Does

This skill injects the A@UI command protocol into a backend AI agent's system prompt. It teaches the agent how to emit valid `render`, `update`, and `destroy` commands so a frontend runtime can consume them and render widgets.

Use this skill when:

- the agent is supposed to drive a UI through structured commands
- the backend uses an AI SDK that supports skill-based prompt injection
- you need the agent to stay within the A@UI command contract
- you are replacing ad-hoc UI payloads with a standardized protocol

Do not use this skill for:

- frontend runtime setup or npm package installation (use `a-at-ui-setup`)
- plain text answers with no UI intent
- component business logic

## Core Principle

Backends do **not** need an A@UI SDK. They only emit JSON command objects. The frontend runtime handles widget lifecycles, mounting, and event forwarding.

## Valid Commands

Only three command types exist. Do not invent new ones.

### render

Create and mount a new widget instance.

```json
{
  "type": "render",
  "component": "SearchBox",
  "params": {
    "placeholder": "搜索..."
  }
}
```

**Rules:**
- `type` and `component` are required
- `params` is optional
- **Never** include `widgetId` — the frontend runtime generates it

### update

Shallow-merge new params into an existing widget instance.

```json
{
  "type": "update",
  "widgetId": "widget_42",
  "params": {
    "loading": false,
    "results": [{"id": 1, "name": "A@UI"}]
  }
}
```

**Rules:**
- `type`, `widgetId`, and `params` are all required
- `params` must be an object
- Targets an already-rendered widget; the runtime skips unknown `widgetId` with a warning

### destroy

Remove an existing widget instance.

```json
{
  "type": "destroy",
  "widgetId": "widget_42"
}
```

**Rules:**
- `type` and `widgetId` are required
- No extra fields allowed
- Destroying an unknown `widgetId` is a safe no-op

## Streaming Format (SSE)

When streaming over Server-Sent Events, each command is one `data:` line. End the stream with `data: [DONE]`.

```text
data: {"type":"render","component":"SearchBox","params":{"placeholder":"搜索..."}}

data: [DONE]

```

## Hard Constraints

These rules are non-negotiable. Violating any of them produces invalid output.

1. **Only `render`, `update`, `destroy`.** No other command types exist.
2. **`render` must not include `widgetId`.** The runtime generates it.
3. **`update` must include `params`.** It is required.
4. **All values must be JSON-serializable.** No functions, class instances, DOM nodes, Dates, Maps, or framework refs.
5. **Component names must exist in the project's manifest.** Unknown components cause runtime errors.
6. **Do not assume widget IDs** ahead of the initial render unless the surrounding system explicitly returns them.
7. **Keep params focused on UI state**, not transport metadata or backend internals.
8. **Output must be valid JSON** that conforms to the A@UI command protocol (see rules 1–7 above).

## Common Failure Modes

### ❌ Injecting widgetId into render

```json
{"type": "render", "widgetId": "widget_123", "component": "SearchBox"}
```

Why wrong: `render` must not provide `widgetId`.

### ❌ Omitting params from update

```json
{"type": "update", "widgetId": "widget_42"}
```

Why wrong: `update` requires `params`.

### ❌ Inventing command types

```json
{"type": "replace", "component": "SearchBox"}
```

Why wrong: `replace` is not an A@UI command.

### ❌ Non-serializable values

```json
{"type": "render", "component": "Chart", "params": {"onClick": "() => {...}"}}
```

Why wrong: functions are not JSON-serializable.

### ❌ Markdown wrapping around JSON

```text
Here is the search result:
data: {"type":"render",...}
```

Why wrong: the SSE stream must contain only `data:` lines, not prose.

## Validation Checklist

Before the agent emits a command stream, verify:

1. Each command is valid JSON — no trailing commas, no unquoted keys.
2. Each command uses exactly one of `render`, `update`, or `destroy`.
3. Required fields are present; forbidden fields are absent.
4. All `component` names match the manifest registered in the frontend.
5. All values are plain JSON types (string, number, boolean, null, array, object).
6. The SSE stream ends with `data: [DONE]` when using SSE transport.

## Relationship to Project Manifest

This skill covers the **protocol rules** — what commands look like, how to stream them, what's valid vs invalid.

The **project-specific manifest** (which components exist, their params schemas, and event types) is injected separately by the project at build time or runtime. The manifest is NOT part of this skill, because each project registers different components.

A complete agent system prompt should be layered as:

```
[Project business prompt + tool descriptions]
     +
[A@UI protocol rules (this skill)]
     +
[Project manifest + component selection rules (project-specific)]
```

## References

- [A@UI Protocol Documentation](https://a-at-ui.mengqinghe.com/zh/protocol/commands)
- [A@UI Frontend Vue Guide](https://a-at-ui.mengqinghe.com/zh/guides/frontend-vue)
