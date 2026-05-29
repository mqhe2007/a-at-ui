---
title: Node.js 后端接入指南
---

# Node.js 后端接入指南

A@UI 的后端接入原则只有一条：消费协议，不消费 SDK。

## 约束

- 不安装任何 A@UI 后端 SDK
- 只输出符合 `assets/commands.schema.json` 的 JSON 命令
- 每条命令写成一行 `data: <json>`，结束时输出 `data: [DONE]`

## 最小 SSE 示例

```text
data: {"type":"render","component":"PersonalProfileCard","params":{"name":"陈叙","title":"内容策略师"}}

data: [DONE]
```

## 示例：原生 http 模块

```js
import http from 'node:http'

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const commands = [
    { type: 'render', component: 'PersonalProfileCard', params: { name: '陈叙', title: '内容策略师' } },
    { type: 'render', component: 'ArticleList', params: { items: [] } },
  ]

  for (const cmd of commands) {
    res.write(`data: ${JSON.stringify(cmd)}\n\n`)
  }

  res.write('data: [DONE]\n\n')
  res.end()
}).listen(3000)
```

## 实现步骤

1. 根据业务意图决定要输出哪些 `render`、`update`、`destroy` 命令。
2. 确保 `component` 名称与前端 manifest/registry 一致。
3. 让 `params` 只包含纯 JSON 数据。
4. 用 `data:` 包裹每条命令，以 `\n\n` 结尾。
5. 输出 `data: [DONE]\n\n` 结束流。

## 常见错误

- 试图在后端创建或依赖 widgetId
- 在命令里塞入函数、Date、Map 或不可序列化对象
- 使用未注册的组件名
- 输出 markdown 或日志文字污染 SSE 数据流
