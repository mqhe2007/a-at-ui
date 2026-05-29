---
title: Agent Skill Guide
---

# Agent Skill Guide

A@UI provides three installable Agent Skills for different use cases.

## Three Skills

| Skill              | Target                                        | Purpose                                                                        |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `a-at-ui-manifest` | Component library authors                     | Guide creating and maintaining `a-at-ui.manifest.json`                         |
| `a-at-ui-setup`    | AI Coding tools (Claude Code, Codex, VS Code) | Guide installation, frontend runtime wiring, and manifest setup                |
| `a-at-ui-protocol` | Backend AI SDKs with skill support            | Inject A@UI protocol rules to constrain backend agents to valid command output |

Their relationship:

```
┌──────────────────────────────────────┐
│  a-at-ui-manifest (library author)   │
│  Create & ship manifest.json         │
└──────────────┬───────────────────────┘
               │ manifest imported
               ▼
┌──────────────────────────────────────┐
│  a-at-ui-setup (developer)           │
│  Install / wire / configure          │
└──────────────┬───────────────────────┘
               │ setup complete
               ▼
┌──────────────────────────────────────┐
│  a-at-ui-protocol (backend runtime)  │
│  Agent emits correct commands        │
└──────────────────────────────────────┘
```

## a-at-ui-manifest (Library Author Skill)

For component library authors who need to create or maintain an `a-at-ui.manifest.json`.

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui-manifest
```

## a-at-ui-setup (IDE Integration Skill)

For adding A@UI to a frontend project.

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui-setup
```

## a-at-ui-protocol (Protocol Injection Skill)

For backend agents that need to emit `render`/`update`/`destroy` command streams. The project's system prompt should be layered as:

```
[Project business prompt + tool descriptions]
     +
[A@UI protocol rules (injected by this skill)]
     +
[Project manifest + component selection rules (project-maintained)]
```

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui-protocol
```

## Related Docs

- [Vue Frontend Guide](/docs/guides/frontend-vue)
- [Node.js Backend Guide](/docs/guides/backend-nodejs)
- [Component Manifest](/docs/guides/component-manifest)
- [Command Protocol](/docs/protocol/commands)
