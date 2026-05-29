# A@UI

[English](./README.md)

[![npm version](https://img.shields.io/npm/v/a-at-ui)](https://www.npmjs.com/package/a-at-ui)
[![release](https://img.shields.io/github/v/tag/mqhe2007/a-at-ui?sort=semver&label=release)](https://github.com/mqhe2007/a-at-ui/releases)
[![license](https://img.shields.io/github/license/mqhe2007/a-at-ui)](https://github.com/mqhe2007/a-at-ui/blob/main/LICENSE)
[![CI](https://github.com/mqhe2007/a-at-ui/actions/workflows/test.yml/badge.svg)](https://github.com/mqhe2007/a-at-ui/actions/workflows/test.yml)
[![skills.sh](https://skills.sh/b/mqhe2007/a-at-ui)](https://skills.sh/mqhe2007/a-at-ui)
[![docs](https://img.shields.io/badge/docs-online-0A7C66)](https://a-at-ui.mengqinghe.com)

A@UI 是一套面向 AI Agent 的协议规范与前端运行时。任意后端只需要按协议输出 JSON 命令流；前端负责注册 manifest 和组件，并消费命令流即可完成渲染。

文档站：<https://a-at-ui.mengqinghe.com>

## 安装

安装前端运行时包：

```bash
npm install a-at-ui
```

## 安装 Skill

通过 skills CLI 安装 A@UI skill：

```bash
npx skills add mqhe2007/a-at-ui --skill a-at-ui
```

## 仓库内容

- 协议真相源：SKILL、prompt 片段、JSON Schema、参考文档
- 前端运行时：`a-at-ui` 主入口和 `a-at-ui/runtime/**` 子路径
- 后端接入方式：任意语言直接输出 A@UI 命令流，无需后端 SDK

## 贡献指南

欢迎任何形式的贡献，包括 Bug 报告、功能建议、文档改进和代码提交。

详细流程见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

### 本地开发

```bash
# 安装依赖
bun install

# 启动文档站开发服务器
bun website:dev

# 运行测试
bun run test

# 校验 JSON Schema
bun run schema:test
```

### 目录结构

| 目录                | 说明                      |
| ------------------- | ------------------------- |
| `packages/a-at-ui/` | 前端运行时核心包          |
| `apps/website/`     | 文档站（Nuxt）            |
| `skills/a-at-ui/`   | Agent Skill 定义与 Schema |

### 提交规范

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)，例如：

```text
feat(runtime): 新增 frontend adapter 的流式渲染支持
fix(schema): 修正 commands schema 中的必填字段
docs: 补充后端接入指南示例
```

### Pull Request 流程

1. Fork 本仓库并基于 `main` 创建特性分支。
2. 实现改动并确保 `bun run test` 与 `bun run schema:test` 全部通过。
3. 提交 PR，描述改动的动机与影响范围。

## License

MIT
