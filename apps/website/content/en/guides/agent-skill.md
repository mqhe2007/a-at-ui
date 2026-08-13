---
title: Agent Skill Guide
---

# Agent Skill Guide

Braid provides three installable Agent Skills for different use cases.

## Three Skills

| Skill              | Target                                        | Purpose                                                                        |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `braid-manifest` | Component library authors                     | Guide creating and maintaining `braid.manifest.json`                         |
| `braid-setup`    | AI Coding tools (Claude Code, Codex, VS Code) | Guide installation, frontend runtime wiring, and manifest setup                |
| `braid-protocol` | Backend AI SDKs with skill support            | Inject Braid protocol rules to constrain backend agents to valid command output |

Their relationship:

```
┌──────────────────────────────────────┐
│  braid-manifest (library author)   │
│  Create & ship manifest.json         │
└──────────────┬───────────────────────┘
               │ manifest imported
               ▼
┌──────────────────────────────────────┐
│  braid-setup (developer)           │
│  Install / wire / configure          │
└──────────────┬───────────────────────┘
               │ setup complete
               ▼
┌──────────────────────────────────────┐
│  braid-protocol (backend runtime)  │
│  Agent emits correct commands        │
└──────────────────────────────────────┘
```

## braid-manifest (Library Author Skill)

For component library authors who need to create or maintain an `braid.manifest.json`.

```bash
npx skills add mqhe2007/braid --skill braid-manifest
```

## braid-setup (IDE Integration Skill)

For adding Braid to a frontend project.

```bash
npx skills add mqhe2007/braid --skill braid-setup
```

## braid-protocol (Protocol Injection Skill)

For backend agents that need to emit `render`/`update`/`destroy` commands. Let the skill mechanism load the protocol rules from `SKILL.md` on demand. The effective system context should be layered as:

```
[Project business prompt + tool descriptions]
     +
[Braid protocol rules (loaded from this skill)]
     +
[Project manifest + component selection rules (project-maintained)]
```

```bash
npx skills add mqhe2007/braid --skill braid-protocol
```

## Related Docs

- [Vue Frontend Guide](/docs/guides/frontend-vue)
- [Node.js Backend Guide](/docs/guides/backend-nodejs)
- [Component Manifest](/docs/guides/component-manifest)
- [Command Protocol](/docs/protocol/commands)
