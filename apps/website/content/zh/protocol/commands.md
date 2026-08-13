---
title: 命令协议
---

# 命令协议

Braid 当前定义三种命令：`render`、`update`、`destroy`。

## render

创建并渲染一个组件实例。

```json
{
  "type": "render",
  "component": "SearchBox",
  "params": {
    "placeholder": "搜索项目"
  }
}
```

约束：

- 必填：`type`、`component`
- 可选：`params`
- 不允许：`widgetId`

## update

对已有组件实例做浅合并更新。

```json
{
  "type": "update",
  "widgetId": "widget-1",
  "params": {
    "value": "Mercury"
  }
}
```

约束：

- 必填：`type`、`widgetId`、`params`
- `params` 必须是对象

## destroy

销毁已有组件实例。

```json
{
  "type": "destroy",
  "widgetId": "widget-1"
}
```

约束：

- 必填：`type`、`widgetId`
- 不允许额外字段

## 传输格式

首个标准传输示例为 SSE：

```text
data: {"type":"render","component":"SearchBox","params":{"placeholder":"搜索项目"}}

data: [DONE]

```

规范真相源见 `assets/commands.schema.json`。
