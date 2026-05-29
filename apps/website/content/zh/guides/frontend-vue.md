---
title: Vue 前端接入指南
---

# Vue 前端接入指南

本指南说明如何在 Vue 应用中接入 `a-at-ui/runtime/vue`。

## 前置条件

- 已有 Vue 3 应用
- 组件库提供 `a-at-ui.manifest.json`
- 你能拿到 manifest 中每个组件名对应的 Vue 组件实现

## 安装

前端接入必须使用官方 npm 运行时，不要自行实现 A@UI runtime：

```bash
npm install a-at-ui vue
```

## 接入步骤

1. 使用 Vue 标准 `app.component()` 全局注册组件库。
2. 安装 A@UI 插件 `createAAtUIPlugin`。
3. 在 setup 中通过 `useAAtUIAdapter()` 获取 `createAdapter` 工厂。
4. 调用 `createAdapter()` 创建适配器并消费命令流。

## 推荐方式：插件模式

组件通过 Vue 全局注册，A@UI 插件自动发现，无需手动维护组件映射。

```ts
// main.ts
import { createApp } from 'vue'
import { createAAtUIPlugin } from 'a-at-ui/runtime/vue'
import manifest from './a-at-ui.manifest.json'
import ArticleList from './ArticleList.vue'
import PersonalProfileCard from './PersonalProfileCard.vue'

const app = createApp(App)

// 1. 按 Vue 标准方式全局注册组件库
app.component('PersonalProfileCard', PersonalProfileCard)
app.component('ArticleList', ArticleList)

// 2. 安装 A@UI 插件（自动从全局注册表发现 manifest 声明的组件）
app.use(createAAtUIPlugin({ manifest }))

app.mount('#app')
```

```ts
// 组件内使用
import { useAAtUIAdapter } from 'a-at-ui/runtime/vue'

const { createAdapter } = useAAtUIAdapter()

const adapter = createAdapter({
  mountTarget: '#widget-stage',
  onEvent(event) { console.log(event) },
  onError(error, context) { console.error(context.source, error.message) },
})

await consumeAAtUIStream(response.body, adapter)
```

## 显式组件映射（可选）

如果不想用全局注册，也可以在插件选项中显式传入 `components`：

```ts
app.use(createAAtUIPlugin({
  manifest,
  components: {
    PersonalProfileCard,
    ArticleList,
  },
}))
```

**解析优先级**：`components` 显式映射 > `app.component()` 全局注册。

## 运行时行为

- `render`：创建新 widget，生成 `widgetId`
- `update`：按浅合并更新 props
- `destroy`：卸载组件并释放 DOM
- 组件事件：runtime 自动补齐 `widgetId` 和 `timestamp`

这些行为由 `a-at-ui/runtime/vue` 提供，集成时不应在业务项目中重新实现。

## 示例

完整示例见 `examples/frontend-vue`。
