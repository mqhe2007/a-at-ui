---
title: 传输规范
---

# 传输规范

Braid 当前支持的传输格式为 SSE (Server-Sent Events)。

## SSE 格式

每条 Braid 命令以一行 `data: <json>` 发送，以 `\n\n` 结尾。命令流以 `data: [DONE]` 标记结束。

```text
data: {"type":"render","component":"SearchBox","params":{"placeholder":"搜索项目"}}

data: {"type":"update","widgetId":"widget-1","params":{"value":"Mercury"}}

data: [DONE]
```

## 流解析行为

`consumeBraidStream()` 按以下规则解析 SSE 流：

1. 逐行读取，过滤空行。
2. 只处理以 `data:` 开头的行，其他行静默跳过。
3. `data:` 后的空白会被 trim。
4. 遇到 `[DONE]` 立即返回，不再处理后续数据。
5. 每个 `data:` 行的 payload 会被 `JSON.parse()` 解析：
   - 解析成功 → 校验命令结构 → 合法则 dispatch，不合法则通过 `onError` 通道暴露
   - 解析失败 → 通过 `onError` 通道暴露，附带原始 payload
6. 流结束后如果缓冲区有残留内容，通过 `onError` 暴露 "trailing partial SSE frame"。

## 缓冲区处理

解析器内部维护一个行缓冲区，处理 `data:` 行被分割在多段 chunk 中的情况：

```ts
let buffer = '';
// 每次 chunk 到达时追加，按行分割
buffer += chunk;
const lines = buffer.split(/\r?\n/);
buffer = lines.pop() ?? ''; // 最后一段可能不完整，留在缓冲中
```

## WebSocket 与 HTTP Polling

WebSocket 和 HTTP Polling 是计划中的传输方式，当前尚未实现具体的前端运行时消费逻辑。如果通过其他方式将合法命令送入 Runtime API，Runtime 自身不关心字节来源。

## 参考

- `packages/braid/src/runtime/vue/stream.ts` — SSE 流解析实现
- `packages/braid/src/runtime/vue/adapter.ts` — `dispatch()` 和 `handleError()` 接口
