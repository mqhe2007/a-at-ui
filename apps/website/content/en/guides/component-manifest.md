---
title: Component Manifest
---

# Component Manifest

Third-party component libraries declare their capabilities to the A@UI runtime by providing an importable `a-at-ui.manifest.json`.

## Minimal Manifest Structure

```json
{
  "specVersion": "0.1.0",
  "library": {
    "name": "your-library",
    "version": "1.0.0"
  },
  "components": [
    {
      "name": "PersonalProfileCard",
      "description": "Profile panel with a contact action",
      "params": true,
      "events": [],
      "lifecycle": {
        "render": true,
        "update": true,
        "destroy": true
      }
    }
  ]
}
```

## Naming Conventions

- `components[].name` must match the frontend registry key exactly
- Use `ComponentName:action` for event names, e.g. `PersonalProfileCard:contact`

## Parameter & Event Design Tips

- Keep `params` narrow — avoid unrestricted `object`
- `events[].payload` must be a serializable JSON Schema fragment
- Lifecycle capabilities should be declared explicitly — do not rely on implicit defaults

## Official Schema

`assets/a-at-ui.manifest.schema.json`
