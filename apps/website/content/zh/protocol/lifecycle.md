---
title: 生命周期
---

# 生命周期与错误策略

## 生命周期

1. 前端使用 manifest、registry 和 mount target 初始化 adapter。
2. runtime 校验 manifest 与 registry 是否一致。
3. 后端输出命令流，前端按顺序消费。
4. `render` 创建 widget 实例并生成 `widgetId`。
5. `update` 对 widget props 做浅合并。
6. `destroy` 卸载组件并清理内部状态。

## 错误策略

- mount target 不存在：抛错
- 未注册组件：抛错
- manifest 与 registry 不一致：初始化阶段抛错
- 未知 widget 的 `update`：警告并跳过
- 未知 widget 的 `destroy`：警告并视为幂等 no-op
- 非法 JSON：通过错误通道暴露，不静默吞掉
- schema 非法命令：通过错误通道暴露，不做猜测性修复

## 事件包装

组件只负责发出 `type` 和 `payload`，runtime 自动补齐：

- `widgetId`
- `timestamp`

详细参考见 `references/lifecycle.md`。
