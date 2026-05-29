---
title: Agent Skill 指南
---

# Agent Skill 指南

A@UI 提供三个可安装的 Agent Skill，分别面向不同使用场景。它们把协议规则、接入步骤、常见错误约束放进 AI 可读取的上下文里，减少临时提示词遗漏和错误实现。

## 三个 Skill

| Skill              | 安装目标                                         | 用途                                                   |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------ |
| `a-at-ui-manifest` | 组件库作者                                       | 指导创建和维护 `a-at-ui.manifest.json`                 |
| `a-at-ui-setup`    | AI Coding 工具（Claude Code、Codex、VS Code 等） | 指导在项目中安装 npm 包、接入前端运行时、配置 manifest |
| `a-at-ui-protocol` | 后端 AI SDK（支持 Skill 机制）                   | 注入 A@UI 协议规则，约束后端 Agent 按规范输出命令流    |

三者的关系：

```
┌──────────────────────────────────────┐
│  a-at-ui-manifest（组件库作者）       │
│  创建和发布 manifest.json             │
└──────────────┬───────────────────────┘
               │ manifest 被导入
               ▼
┌──────────────────────────────────────┐
│  a-at-ui-setup（开发时）              │
│  安装 / 接入 / 配置                   │
└──────────────┬───────────────────────┘
               │ 接入完成后
               ▼
┌──────────────────────────────────────┐
│  a-at-ui-protocol（运行时）           │
│  驱动后端 Agent 输出正确命令           │
└──────────────────────────────────────┘
```

## a-at-ui-manifest（组件库作者技能）

### 适用场景

- 组件库首次接入 A@UI，需要创建 `a-at-ui.manifest.json`
- 向已有库新增组件，需要更新 manifest
- 设计组件的 params、events、lifecycle 声明
- 校验已有 manifest 是否符合规范

### 安装

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui-manifest
```

### 推荐使用方式

```text
使用 a-at-ui-manifest 技能帮我的组件库创建 a-at-ui.manifest.json。我的组件包括 PersonalProfileCard 和 ArticleList。
```

## a-at-ui-setup（IDE 集成技能）

### 适用场景

- 在已有前端应用中接入 A@UI 前端运行时
- 安装 `a-at-ui` npm 包并选择框架适配器
- 配置 `a-at-ui.manifest.json` 并注册前端组件
- 排查组件名、manifest 和 registry 不一致的问题

### 安装

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui-setup
```

### 推荐使用方式

```text
使用 a-at-ui-setup 技能帮我在 Vue 项目中接入 A@UI。安装官方 npm 包，读取组件 manifest，接入前端运行时。
```

## a-at-ui-protocol（协议注入技能）

### 适用场景

- 后端 Agent 需要输出 `render`、`update`、`destroy` 命令流
- 通过 AI SDK 的 Skill 机制注入协议约束
- 确保命令格式、字段、流式格式符合规范
- 避免 Agent 发明不存在的命令类型

### 安装

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui-protocol
```

### 推荐使用方式

在 AI SDK 的系统提示词中引入该 Skill 提供的协议规则。项目的系统提示词应按三层拼接：

```
[项目业务提示词 + 工具描述]
     +
[a-at-ui-protocol 注入的协议规则]
     +
[项目 manifest + 组件选择规则（项目自行维护）]
```

## 常见收益

- 避免 Agent 自己实现一套前端运行时
- 避免把 `widgetId` 放进 `render` 命令
- 避免输出协议外的命令类型或非 JSON 数据
- 避免组件名、manifest 和 registry 不一致
- 让接入步骤更接近官方文档和包导出
- 将协议规则与项目 manifest 解耦，各自独立维护

## 相关文档

- [Vue 前端接入指南](/docs/guides/frontend-vue)
- [Node.js 后端接入指南](/docs/guides/backend-nodejs)
- [组件库 Manifest](/docs/guides/component-manifest)
- [命令协议](/docs/protocol/commands)
