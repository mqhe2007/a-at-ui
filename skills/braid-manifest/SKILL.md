---
name: braid-manifest
description: "Use when a component library author needs to create, validate, or maintain the braid.manifest.json file that declares components to the Braid runtime. Covers manifest schema, component registration, params design, event definitions, and lifecycle declarations. Targets component library maintainers integrating with Braid."
metadata:
  author: braid
  version: "0.2.0"
---

# Braid Manifest Skill

## What This Skill Does

This skill guides component library authors through creating and maintaining `braid.manifest.json` — the file that declares which components are available to the Braid runtime and how AI agents can interact with them.

Use this skill when:

- you are a component library author integrating with Braid
- you need to create a new `braid.manifest.json` from scratch
- you are adding new components to an existing library and need to update the manifest
- you want to validate an existing manifest against the schema
- you need to design component params, events, and lifecycle declarations

Do not use this skill for:

- installing Braid in a consumer project (use `braid-setup`)
- emitting Braid commands from a backend agent (use `braid-protocol`)
- wiring frontend runtime or framework adapters (use `braid-setup`)

## The Manifest File

Every Braid-compatible component library must ship a `braid.manifest.json` at its package root. This file tells the Braid runtime and AI agents:

- **What components exist** — their names, descriptions
- **What params they accept** — shape, required fields, types
- **What events they emit** — event types and payload shapes
- **What lifecycle operations they support** — render, update, destroy

The manifest is the contract between the component library and the AI agent. The agent reads this file to know which components it can use and what params to send.

## Manifest Schema

### Top-level Structure

```json
{
  "specVersion": "0.1.0",
  "library": {
    "name": "your-component-library",
    "version": "1.0.0",
    "description": "Optional library description",
    "homepage": "https://optional-homepage.url"
  },
  "components": []
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `specVersion` | Yes | Manifest schema version. Currently `"0.1.0"`. |
| `library.name` | Yes | Library package name. Used for scoping. |
| `library.version` | Yes | Library version. Should match `package.json` version. |
| `library.description` | No | Human-readable library description. |
| `library.homepage` | No | Library documentation URL. |
| `components` | Yes | Array of component definitions (can be empty). |

### Component Definition

```json
{
  "name": "PersonalProfileCard",
  "description": "Profile panel with a contact action",
  "params": true,
  "events": [
    {
      "type": "PersonalProfileCard:contact",
      "description": "Fired when user clicks the contact button",
      "payload": {
        "userId": { "type": "string" }
      }
    }
  ],
  "lifecycle": {
    "render": true,
    "update": true,
    "destroy": true
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Component name. Must exactly match the frontend registry key. |
| `description` | Yes | What this component does. AI agents read this to select the right component. |
| `params` | Yes | Parameter schema. `true` for any params, or a JSON Schema-like object. |
| `events` | Yes | Array of event definitions (can be `[]`). |
| `lifecycle` | Yes | Which lifecycle operations are supported. |

#### params Design

The `params` field defines what data a component accepts. It can be:

**Open (accept any params):**
```json
"params": true
```

Use `true` when the component has no strict parameter requirements and can handle arbitrary data. This is the simplest approach but gives AI agents less guidance.

**Closed with schema (recommended):**
```json
"params": {
  "type": "object",
  "properties": {
    "userId": { "type": "string", "description": "User identifier to display" },
    "showContact": { "type": "boolean", "description": "Whether to show the contact button", "default": true }
  },
  "required": ["userId"]
}
```

Closed schemas give AI agents precise guidance on what to pass. Always include `description` on each property to help the agent understand intent.

**Design principles:**
- Keep params narrow. Don't expose internal state or implementation details.
- Use `required` to mark mandatory fields.
- Provide meaningful `description` strings — the AI agent reads them.
- All values must be JSON-serializable (no functions, Date, Map, class instances).
- Avoid deeply nested structures when flat params suffice.

#### events Design

Each event in the `events` array describes something the component may emit back to the backend:

```json
{
  "type": "ComponentName:action-name",
  "description": "What triggers this event and what it means",
  "payload": true
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | Unique event type string. Convention: `ComponentName:action`. |
| `description` | Yes | What causes this event and what the payload contains. |
| `payload` | Yes | Payload schema. `true` for any payload, or a JSON Schema fragment. `false` for no payload. |

**Naming convention:** Use `ComponentName:verb` format (e.g., `SearchBox:search`, `PersonalProfileCard:contact`, `Form:submit`). This prevents collisions across components.

**Closed payload (recommended):**
```json
"payload": {
  "type": "object",
  "properties": {
    "userId": { "type": "string" },
    "action": { "type": "string", "enum": ["email", "call", "message"] }
  }
}
```

Set `"payload": false` for events that carry no data (pure signals like "dismissed"). Set `"payload": true` when the payload shape is dynamic and cannot be predicted.

#### lifecycle Design

```json
"lifecycle": {
  "render": true,
  "update": true,
  "destroy": true
}
```

| Field | Meaning |
|-------|---------|
| `render` | Component supports being created and mounted. Almost always `true`. |
| `update` | Component accepts `update` commands to modify its state after creation. Set `false` for static components that never change after render. |
| `destroy` | Component can be removed from the DOM. Almost always `true`. |

**Be explicit.** Do not rely on defaults. AI agents use these flags to determine which commands are valid for a given component.

### Complete Example

Here is a realistic manifest for a "user-profile-widgets" library:

```json
{
  "specVersion": "0.1.0",
  "library": {
    "name": "user-profile-widgets",
    "version": "1.2.0",
    "description": "A set of profile and contact widgets for user-facing UIs",
    "homepage": "https://github.com/example/user-profile-widgets"
  },
  "components": [
    {
      "name": "PersonalProfileCard",
      "description": "Displays a user profile card with avatar, name, bio, and optional contact button",
      "params": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "description": "The user ID to load profile data for"
          },
          "showContact": {
            "type": "boolean",
            "description": "Show a contact action button",
            "default": false
          },
          "compact": {
            "type": "boolean",
            "description": "Use compact layout with less padding",
            "default": false
          }
        },
        "required": ["userId"]
      },
      "events": [
        {
          "type": "PersonalProfileCard:contact",
          "description": "Fired when the user clicks the contact button",
          "payload": {
            "type": "object",
            "properties": {
              "userId": { "type": "string" },
              "method": { "type": "string", "enum": ["email", "call", "message"] }
            }
          }
        }
      ],
      "lifecycle": {
        "render": true,
        "update": true,
        "destroy": true
      }
    },
    {
      "name": "ArticleList",
      "description": "Renders a scrollable list of article previews with optional search filtering",
      "params": {
        "type": "object",
        "properties": {
          "articles": {
            "type": "array",
            "description": "Array of article objects to display",
            "items": {
              "type": "object",
              "properties": {
                "id": { "type": "string" },
                "title": { "type": "string" },
                "summary": { "type": "string" }
              }
            }
          },
          "loading": {
            "type": "boolean",
            "description": "Show a loading skeleton",
            "default": false
          },
          "emptyMessage": {
            "type": "string",
            "description": "Text to display when the article list is empty",
            "default": "No articles found"
          }
        },
        "required": ["articles"]
      },
      "events": [
        {
          "type": "ArticleList:select",
          "description": "Fired when the user clicks on an article",
          "payload": {
            "type": "object",
            "properties": {
              "articleId": { "type": "string" }
            }
          }
        }
      ],
      "lifecycle": {
        "render": true,
        "update": true,
        "destroy": true
      }
    }
  ]
}
```

## Step-by-Step: Creating a Manifest

### Step 1: Inventory Your Components

List every component you want to expose to AI agents. For each, note:
- The exact registered name (must match `app.component('Name', ...)` in Vue)
- What data it needs to render (params)
- What user interactions it emits back (events)
- Whether it can be updated after rendering (lifecycle)

### Step 2: Write the Library Header

```json
{
  "specVersion": "0.1.0",
  "library": {
    "name": "your-library-name",
    "version": "1.0.0"
  },
  "components": []
}
```

Use your npm package name as `library.name`. Keep `library.version` in sync with `package.json`.

### Step 3: Define Each Component

For each component from Step 1, add an entry to the `components` array. Start simple:

```json
{
  "name": "MyComponent",
  "description": "What this component does",
  "params": true,
  "events": [],
  "lifecycle": { "render": true, "update": true, "destroy": true }
}
```

Then refine:
- Replace `"params": true` with a typed schema if you know the expected params
- Add event definitions for each user interaction
- Set `"update": false` if the component is static after initial render

### Step 4: Validate

Place the manifest at the package root alongside `package.json`:
```
your-component-library/
  package.json
  braid.manifest.json
  src/
    ...
```

Ensure:
- All `components[].name` values match registered component names exactly
- All `events[].type` values are unique across the entire manifest
- All values are valid JSON
- `library.version` matches `package.json` version

### Step 5: Publish

The manifest should be published as part of your npm package. Add it to your `package.json` files array if needed:

```json
{
  "files": [
    "dist",
    "braid.manifest.json"
  ]
}
```

Consumers will import it as:
```ts
import manifest from 'your-component-library/braid.manifest.json'
```

## Common Pitfalls

### ❌ Component name mismatch

The `name` in the manifest must exactly match how the component is registered. Case-sensitive.

```json
// manifest:
{ "name": "PersonalProfileCard" }

// Must match Vue registration:
app.component('PersonalProfileCard', PersonalProfileCard)
```

### ❌ Non-serializable params

All param values must be JSON-compatible. No functions, Date objects, class instances, or DOM nodes.

```json
// ❌ Wrong:
"params": { "onClick": { "type": "function" } }

// ✅ Right: use events instead
"events": [{ "type": "Component:click", "payload": { ... } }]
```

### ❌ Forgetting to update the manifest

When you add a new component to your library, you must also add it to the manifest. AI agents can only use components declared in the manifest.

### ❌ Too-broad params

```json
// ❌ Too vague — the agent gets no guidance:
"params": true

// ✅ Better:
"params": {
  "type": "object",
  "properties": {
    "query": { "type": "string", "description": "Search query string" }
  },
  "required": ["query"]
}
```

`"params": true` is acceptable during prototyping, but for production libraries, prefer typed schemas.

### ❌ Event type collisions

```json
// ❌ Two components using the same event type:
{ "events": [{ "type": "submit" }] }
{ "events": [{ "type": "submit" }] }

// ✅ Prefixed with component name:
{ "events": [{ "type": "SearchForm:submit" }] }
{ "events": [{ "type": "ContactForm:submit" }] }
```

### ❌ Missing lifecycle declarations

Always explicitly declare lifecycle capabilities. Don't assume defaults. AI agents check these flags to determine valid commands.

## Relationship to Other Skills

```
┌─────────────────────────────────────────────────┐
│ braid-manifest (this skill)                    │
│ Component library authors create manifest.json   │
└──────────────┬──────────────────────────────────┘
               │ ships manifest.json
               ▼
┌─────────────────────────────────────────────────┐
│ braid-setup                                    │
│ Developers import manifest & wire runtime        │
└──────────────┬──────────────────────────────────┘
               │ manifest injected into prompt
               ▼
┌─────────────────────────────────────────────────┐
│ braid-protocol                                 │
│ Backend agent reads manifest, emits commands     │
└─────────────────────────────────────────────────┘
```

## Validation Checklist

Before shipping a manifest, verify:

1. File is valid JSON — no trailing commas, no unquoted keys.
2. `specVersion` is `"0.1.0"`.
3. `library.name` and `library.version` are present and correct.
4. Every component has `name`, `description`, `params`, `events`, and `lifecycle`.
5. All component names are unique.
6. All event types are unique across the manifest.
7. All param and payload schemas use only JSON-compatible types.
8. `lifecycle` fields are all explicitly `true` or `false` (not omitted).
9. Component names exactly match the frontend registry keys.
10. The file is included in the npm package (check `files` in `package.json`).

## References

- [Component Manifest Guide](https://braid.mengqinghe.com/zh/guides/component-manifest)
- [Commands Protocol Reference](../braid-protocol/SKILL.md) — the protocol that consumes the manifest
- [Setup Skill](../braid-setup/SKILL.md) — how consumers use the manifest
