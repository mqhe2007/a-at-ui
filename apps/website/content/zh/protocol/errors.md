---
title: 错误参考
---

# 错误参考

Braid Runtime 在以下场景中产生错误。所有错误通过 `onError` 回调暴露，回调中附带 `source` 和上下文信息。

## 错误类型

### 初始化错误

| 场景 | 错误消息 | 触发时机 |
|------|---------|---------|
| 插件未安装 | `useBraidAdapter() must be called after installing the Braid plugin` | 在未安装插件时调用 `useBraidAdapter()` |
| 全局注册缺失 | `Component "X" not found. Register it globally...` | 插件安装时组件名不在全局注册表且无显式映射 |
| manifest 组件缺失 | `Manifest component "X" has no matching Vue component` | `WidgetManager` 初始化时 manifest 声明的组件无对应 Vue 实现 |
| mount target 找不到 | `Mount target not found: "selector"` | 传入的 CSS 选择器在 DOM 中无法匹配到元素 |

### 命令校验错误

| 场景 | 错误消息 | source |
|------|---------|--------|
| JSON 解析失败 | `JSON.parse` 错误（原生 Error） | `stream` |
| 非法命令结构 | `Invalid command payload.` | `stream` |

### 调度错误

| 场景 | 错误消息 | source |
|------|---------|--------|
| 未知组件 | `Unknown component: "X"` | `dispatch` |
| 组件不支持 render | `Component does not support render: "X"` | `dispatch` |
| 组件不支持 update | `Component does not support update: "X"` | `dispatch` |
| 组件不支持 destroy | `Component does not support destroy: "X"` | `dispatch` |
| 不支持的命令类型 | `Unsupported command type: "X"` | `dispatch` |

### 流协议错误

| 场景 | 行为 | source |
|------|------|--------|
| 残留部分 SSE 帧 | `Trailing partial SSE frame.` 通过 `onError` 暴露 | `stream` |
| 事件 payload 不可序列化 | `Event payload must be JSON-serializable` 抛错 | `dispatch` |

## 警告（非 Error）

| 场景 | 行为 |
|------|------|
| 未知 widget 的 update | `console.warn`，跳过该命令 |
| 未知 widget 的 destroy | `console.warn`，视为幂等 no-op |

## 错误上下文结构

通过 `onError(error, context)` 回调暴露的上下文对象：

```ts
interface BraidAdapterErrorContext {
  source: 'stream' | 'dispatch' | 'config';
  raw?: string;       // SSE 原始 payload（来源为 stream 时）
  command?: unknown;   // 已解析的命令对象（来源为 dispatch 时）
}
```

## 参考

- `packages/braid/src/runtime/vue/adapter.ts` — `BraidAdapterErrorContext` 类型定义
- `packages/braid/src/runtime/vue/widget-manager.ts` — 调度错误实现
- `packages/braid/src/runtime/vue/stream.ts` — 流错误实现
