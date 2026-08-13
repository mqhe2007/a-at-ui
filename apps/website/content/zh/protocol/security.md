---
title: 安全模型
---

# 安全模型

Braid 的安全设计基于**声明式组件约束**——Agent 只能使用预先注册的组件，不能注入任意代码或操作未授权的 DOM。

## 组件白名单

所有可被 Agent 驱动的 UI 组件必须通过 `braid.manifest.json` 声明。Runtime 在初始化时构建组件映射表：

- 插件安装阶段：遍历 manifest 中的每个组件名，从显式映射或 Vue 全局注册表中查找对应实现
- 组件未找到 → 初始化抛错，拒绝启动
- 接收到 manifest 未声明的组件名 → 调度阶段抛错

Agent 无法在流中加入未注册组件的 `render` 命令。

## 命令校验

每条命令在 dispatch 前会经过结构校验，规则如下：

**render**
- `type` 必须是 `"render"`
- `component` 必须是字符串
- 不允许带 `widgetId`

**update**
- `type` 必须是 `"update"`
- `widgetId` 必须是非空字符串
- `params` 必须是对象

**destroy**
- `type` 必须是 `"destroy"`
- `widgetId` 必须是非空字符串
- 不允许带 `component` 或 `params`

流中遇到不合法命令时，不静默吞掉，通过 `onError` 通道暴露原始 payload 和错误信息。

## widgetId 隔离

`widgetId` 由前端 Runtime 在 `render` 时生成（`crypto.randomUUID()`），后端 Agent 无法指定或预知 widgetId。update 和 destroy 命令中的 widgetId 引用由 Runtime 校验，指向不存在的 widget 时发出警告并跳过。

## Payload 序列化校验

组件事件 payload 在 emit 到 Agent 层之前经过 `isSerializableValue()` 校验，确保只包含 JSON 兼容类型（string、number、boolean、null、数组、纯对象）。包含函数、DOM 元素或其他运行时对象的 payload 会被拒绝。

## 生命周期声明

组件在 manifest 中显式声明 `lifecycle.render`、`lifecycle.update`、`lifecycle.destroy`。Runtime 在执行对应操作前检查声明：

- 对声明为 `false` 的生命周期操作 → 抛错
- 对未声明的命令类型 → `Unsupported command type` 错误

## 错误通道

所有非法命令、解析失败、调度错误统一通过 `onError` 回调暴露，不会在 Runtime 内部被丢弃。详细错误类型见 [错误参考](./errors)。

## 参考

- `packages/braid/src/utils.ts` — `validateBraidCommand()` 校验函数
- `packages/braid/src/runtime/vue/widget-manager.ts` — `buildComponentMap()`、`isSerializableValue()`、生命周期检查
- `packages/braid/src/runtime/vue/stream.ts` — 流解析中的命令校验
