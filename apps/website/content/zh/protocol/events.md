---
title: 事件协议
---

# 事件协议

组件事件由前端 runtime 包装后回传给 Agent 层，统一结构如下：

```json
{
  "type": "ArticleList:open",
  "widgetId": "widget-1",
  "payload": {
    "articleId": "article-201",
    "title": "三列线框布局"
  },
  "timestamp": 1716020000000
}
```

## 字段说明

- `type`：组件事件名
- `widgetId`：runtime 生成的组件实例标识
- `payload`：组件输出的纯数据对象
- `timestamp`：runtime 生成的毫秒时间戳

## 约束

- `payload` 必须完全可序列化
- 不能包含函数、DOM、框架实例或其他运行时对象
- runtime 必须自动补齐 `widgetId` 和 `timestamp`

## 设计建议

- 事件名使用 `组件名:动作`
- payload 只表达业务动作和数据，不重复 transport 元信息

规范真相源见 `assets/events.schema.json`。
