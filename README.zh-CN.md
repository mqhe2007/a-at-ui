# A@UI

[English](./README.md)

[![npm version](https://img.shields.io/npm/v/a-at-ui)](https://www.npmjs.com/package/a-at-ui)
[![release](https://img.shields.io/github/v/tag/mqhe2007/a-at-ui?sort=semver&label=release)](https://github.com/mqhe2007/a-at-ui/releases)
[![license](https://img.shields.io/github/license/mqhe2007/a-at-ui)](https://github.com/mqhe2007/a-at-ui/blob/main/LICENSE)
[![CI](https://github.com/mqhe2007/a-at-ui/actions/workflows/test.yml/badge.svg)](https://github.com/mqhe2007/a-at-ui/actions/workflows/test.yml)
[![skills.sh](https://skills.sh/b/mqhe2007/a-at-ui)](https://skills.sh/mqhe2007/a-at-ui)
[![docs](https://img.shields.io/badge/docs-online-0A7C66)](https://a-at-ui.mengqinghe.com)

**一套面向 AI Agent 的协议规范与轻量前端运行时。**

任意后端只需按协议输出 JSON 命令流；前端负责注册 manifest 和组件，并消费命令流渲染真实界面。无需后端 SDK，无需紧耦合，无需执行任意代码。

> [!WARNING]
> A@UI 目前处于快速迭代阶段，稳定版发布前应视为不稳定方案。协议细节、运行时 API、manifest 结构及命令语义均可能变更。
>
> 若在生产环境使用：锁定精确版本号、以仓库中 Schema 资源为准校验 manifest 与命令、升级前阅读 release notes、为未知命令或渲染行为保留兜底策略。

---

<!--
  TODO: 请替换为真实的 Demo GIF。
  建议内容：15-30 秒录屏，展示 AI Agent 发出 render/update/destroy 命令、
  前端实时渲染组件的过程。
-->
<p align="center">
  <img width="1138" height="574" alt="a-at-ui-demo-compressed" src="https://github.com/user-attachments/assets/8076afec-584a-4bd5-8704-7b8cccffddd7" />
</p>

---

## 为什么需要 A@UI

当今构建 AI 驱动的界面，通常只有以下选择：

- **赋予 Agent 完整的 DOM/Canvas 权限** — 功能强大，但不安全且不可预测。
- **采用文档生成方式** — 输出富文本，而非真正的交互组件。
- **接入重型协议** — 多组件目录、传输协商、两端都需 Schema 注册。

A@UI 选择了另一条路：**三条指令、一个 JSON 流、零后端依赖。**

```text
render   → 创建组件实例，传入初始数据
update   → 原地对组件属性做浅合并更新
destroy  → 干净地销毁组件
```

后端只需通过任意传输协议（SSE、WebSocket、HTTP Polling）发出这些指令。前端运行时处理其余一切——组件生命周期、DOM 管理、事件桥接。无需后端 SDK、无需组件目录注册、无需额外元数据。

## 工作原理

```
┌─────────────┐     render/update/destroy      ┌───────────────┐
│  AI Agent   │ ────────── JSON ──────────▶    │  A@UI Runtime │
│  (任意语言)  │                                 │  （前端运行时） │
└─────────────┘                                 └───────┬───────┘
                                                         │
                                                 props / events
                                                         │
                                                  ┌──────▼──────┐
                                                  │  UI Widgets │
                                                  │  (Vue 等)   │
                                                  └─────────────┘
```

- **传输无关**：WebSocket、SSE 或 HTTP Polling 均可驱动协议，Runtime 不关心字节如何到达。
- **后端任意语言**：后端只需会发 JSON。Python、Go、Node.js、Rust 皆可，无需安装任何后端 SDK。
- **前端框架灵活**：Runtime 是轻薄适配层，可使用官方 Vue 适配器，也可按需扩展其他前端栈。

## 快速开始

### 1. 安装

```bash
npm install a-at-ui
```

### 2. 注册组件并安装插件

```ts
import { createApp } from 'vue'
import { createAAtUIPlugin } from 'a-at-ui/runtime/vue'
import manifest from './a-at-ui.manifest.json'
import SearchBox from './SearchBox.vue'
import ArticleList from './ArticleList.vue'

const app = createApp(App)
app.component('SearchBox', SearchBox)
app.component('ArticleList', ArticleList)
app.use(createAAtUIPlugin({ manifest }))
app.mount('#app')
```

### 3. 后端输出命令

```js
import http from 'node:http'

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const commands = [
    { type: 'render', component: 'SearchBox', params: { placeholder: '搜索项目' } },
    { type: 'render', component: 'ArticleList', params: { items: [] } },
  ]

  for (const cmd of commands) {
    res.write(`data: ${JSON.stringify(cmd)}\n\n`)
  }

  res.write('data: [DONE]\n\n')
  res.end()
}).listen(3000)
```

完成。无需后端 SDK、无需传输协商、无需组件目录注册。

## 完整文档

文档站：[a-at-ui.mengqinghe.com](https://a-at-ui.mengqinghe.com)

- [Vue 前端接入指南](https://a-at-ui.mengqinghe.com/zh/docs/guides/frontend-vue)
- [Node.js 后端接入指南](https://a-at-ui.mengqinghe.com/zh/docs/guides/backend-nodejs)
- [组件库 Manifest](https://a-at-ui.mengqinghe.com/zh/docs/guides/component-manifest)
- [命令协议](https://a-at-ui.mengqinghe.com/zh/docs/protocol/commands)
- [事件协议](https://a-at-ui.mengqinghe.com/zh/docs/protocol/events)
- [生命周期与错误策略](https://a-at-ui.mengqinghe.com/zh/docs/protocol/lifecycle)

## Agent Skill

安装 A@UI Skill，让 AI Coding 工具（Claude Code、Codex、VS Code）直接读取协议规则和接入约束：

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui
```

三个子 Skill 分别面向不同角色：
- `a-at-ui-manifest` — 组件库作者创建 manifest
- `a-at-ui-setup` — 开发者接入前端运行时
- `a-at-ui-protocol` — 后端 Agent 输出合规命令流

## 与 A2UI 的对比

[A2UI](https://a2ui.org/) 是 Google 主导的 Agent驱动界面协议。两者目标相似但设计取舍不同：

| 维度         | A@UI                                   | A2UI                                                        |
| ------------ | -------------------------------------- | ----------------------------------------------------------- |
| **后端接入** | 零依赖，任意语言输出纯 JSON            | 需配置目录(catalog)、传输协商、消息路由                     |
| **指令集**   | 3 条指令：render、update、destroy      | 多种消息类型：surface、component、catalog、action、数据绑定 |
| **前端适配** | 轻量运行时适配（Vue），可扩展          | 完整渲染器（Angular、Flutter、Lit、React）                  |
| **传输**     | 传输无关——SSE、WebSocket、HTTP Polling | A2A 扩展 + 基础 SSE                                         |
| **治理**     | 个人开源维护                           | Google + CopilotKit + 社区                                  |
| **协议**     | MIT                                    | Apache 2.0                                                  |
| **稳定度**   | Pre-stable (0.x)                       | v0.8 stable、v0.9 draft                                     |

A@UI 的核心取舍是 **后端接入的极致简洁**——任何能输出 JSON 的服务都能驱动 UI。如果你需要更丰富的协议（正式传输协商、多端渲染器开箱即用），A2UI 可能更合适。

## 安装 Skill

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui
```

## 仓库内容

| 目录                | 说明                                |
| ------------------- | ----------------------------------- |
| `packages/a-at-ui/` | 前端运行时核心包（npm）             |
| `apps/website/`     | 文档站（Nuxt）                      |
| `skills/a-at-ui/`   | Agent Skill 定义与 JSON Schema 资产 |

## 线上示例

使用 A@UI 架构搭建的线上站点：[mengqinghe.com](https://mengqinghe.com)

## 贡献指南

欢迎任何形式的贡献——Bug 报告、功能建议、文档改进和代码提交。

完整工作流程见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

```bash
# 安装依赖
bun install
bun website:dev      # 启动文档站
bun run test         # 运行测试
bun run schema:test  # 校验 JSON Schema
```

### 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/)：

```text
feat(runtime): 新增 frontend adapter 的流式渲染支持
fix(schema): 修正 commands schema 中的必填字段
docs: 补充后端接入指南示例
```

## License

MIT
