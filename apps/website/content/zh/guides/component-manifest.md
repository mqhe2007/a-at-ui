---
title: 组件库指南
---

# 组件库 Manifest

第三方组件库通过提供可导入的 `a-at-ui.manifest.json` 向 A@UI 运行时声明能力。

## manifest 最小结构

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

## 命名规则

- `components[].name` 必须和前端 registry key 完全一致
- 事件名建议使用 `组件名:动作`，例如 `PersonalProfileCard:contact`

## 参数与事件设计建议

- `params` 尽量窄，不要滥用无限制 `object`
- `events[].payload` 必须是可序列化 JSON Schema 片段
- 生命周期能力要显式声明，不要依赖隐式默认值


## 官方 schema

`assets/a-at-ui.manifest.schema.json`
