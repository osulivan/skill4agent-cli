# skill4agent CLI

[![npm version](https://img.shields.io/npm/v/@skill4agent/cli.svg)](https://www.npmjs.com/package/@skill4agent/cli)
[![npm downloads](https://img.shields.io/npm/dm/@skill4agent/cli.svg)](https://www.npmjs.com/package/@skill4agent/cli)
[![GitHub stars](https://img.shields.io/github/stars/osulivan/skill4agent-cli.svg)](https://github.com/osulivan/skill4agent-cli)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> 🚀 **安装和管理 AI 编程助手 Agent Skills 的最简单方式**

由 [skill4agent.com](https://www.skill4agent.com) 提供 - 一个用于安装 Agent Skills 的命令行工具。

[![skill4agent 网站首页](https://raw.githubusercontent.com/osulivan/skill4agent-cli/main/assets/skill4agent_zh.png)](https://www.skill4agent.com)

[English](https://github.com/osulivan/skill4agent-cli/blob/main/README.md) | [中文](https://github.com/osulivan/skill4agent-cli/blob/main/README_CN.md)

---

## 🌟 为什么选择 skill4agent？

- **🎯 精选技能**: 从 [skill4agent.com](https://www.skill4agent.com) 快速安装海量高质量 skills
- **� 双语支持**: 每个 skill 都提供中英文翻译版本，打破语言障碍
- **✅ 质量检测**: 自动检测 skill 中的脚本，确保安全可靠
- **🏷️ 智能分类**: 精细的分类和标签系统，帮你快速找到合适的 skill
- **🤖 AI 友好**: 标签信息写入 SKILL.md，让 AI Agent 更精准匹配你的需求
- **⚡ 一键安装**: 用单个命令安装任何 skill 到多个 IDE
- **🔧 多 IDE 支持**: 支持 Trae、Cursor、Claude、OpenCode、OpenClaw 等
- **🌍 全局与项目安装**: 支持全局安装或按项目安装
- **📦 智能管理**: 轻松列出和卸载技能

---

## 安装

```bash
# 使用 npx（推荐 - 无需安装）
npx skill4agent <命令>

# 或全局安装
npm install -g @skill4agent/cli
```

> 💡 在 [skill4agent.com](https://www.skill4agent.com) 查找可用技能
> - `<源仓库>`: 源仓库名称（如 `anthropics/skills`）
> - `<技能名>`: 技能名称（如 `frontend-design`）

```bash
# 搜索在线技能
npx skill4agent search <关键词> [选项]

# 交互式安装（推荐新手，按照步骤选项安装）
npx skill4agent add <源仓库> <技能名>

# 非交互式安装（适合脚本自动化、AI操作使用）
npx skill4agent install <源仓库> <技能名> [选项]

# 查看已安装的技能列表
npx skill4agent list

# 卸载技能
npx skill4agent uninstall <技能名>
```

## 命令说明

### `search` - 搜索在线技能

在技能库中搜索技能。

```bash
npx skill4agent search <关键词> [选项]
```

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-l, --limit` | 返回结果数量 | 10 |

**输出字段说明：**
- **source**: 源仓库（如 `vercel-labs-agent-skills`）
- **skill_name**: 技能名称
- **category**: 技能分类
- **description**: 完整技能描述
- **tags**: 技能标签
- **installs**: 总安装量

### `add` - 交互式安装

交互式安装，通过提示选择配置选项。

```bash
npx skill4agent add <源仓库> <技能名>
```

### `install` - 非交互式安装

适合脚本和 AI 自动化，通过参数指定配置。

```bash
npx skill4agent install <源仓库> <技能名> [选项]
```

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--type` | `original` 或 `translated` | original |
| `--global` | 是否全局安装，不传则安装在项目目录 | 项目目录 |
| `--dirs` | 安装目录（逗号分隔），如 ".trae,.cursor" | 默认仅安装在".agents"目录下 |
| `--method` | `symlink` 或 `copy` | symlink |

### `list` - 查看已安装技能

显示所有已安装的技能及其安装详情。

```bash
npx skill4agent list
```

**输出列说明：**
- **Name**: 技能名称
- **Source**: 源仓库（如 `anthropics/skills`）
- **Scope**: 安装范围（`Global`、`Project` 或 `Global,Project`）
- **Installed**: 安装日期

### `uninstall` - 卸载技能

移除已安装的技能。

```bash
# 从所有范围卸载（全局和所有项目）
npx skill4agent uninstall <技能名>

# 仅从全局卸载
npx skill4agent uninstall <技能名> --global

# 仅从所有项目卸载（非全局安装）
npx skill4agent uninstall <技能名> --project
```

## 示例

### 搜索示例

```bash
# 搜索技能（默认返回10条结果）
npx skill4agent search 前端设计

# 搜索技能并指定返回数量
npx skill4agent search 前端设计 -l 5
```

### 安装示例

```bash
# 最简：以所有默认参数安装
npx skill4agent install anthropics/skills frontend-design

# 安装到指定目录，多个目录逗号分隔
npx skill4agent install anthropics/skills frontend-design --dirs ".trae,.cursor"

# 全局安装，所有项目可用
npx skill4agent install anthropics/skills frontend-design --global

# 完整参数
npx skill4agent install anthropics/skills frontend-design \
  --type original \
  --global \
  --dirs ".trae,.cursor" \
  --method symlink
```

### 列表示例

```bash
$ npx skill4agent list

📦 Installed Skills (3 skills, 5 installs)
────────────────────────────────────────────────────────────────────────────────
Name                      Source                    Scope           Installed
────────────────────────────────────────────────────────────────────────────────
frontend-design           anthropics/skills         Global,Project  2026/02/08
agent-tools               inferencesh/skills        Global          2026/02/07
web-search                custom/skills             Project         2026/02/06
────────────────────────────────────────────────────────────────────────────────

Total: 3 skills (5 installs)
```

### 卸载示例

```bash
# 完全卸载（所有范围）
npx skill4agent uninstall frontend-design

# 仅从全局卸载
npx skill4agent uninstall frontend-design --global

# 仅从所有项目卸载
npx skill4agent uninstall frontend-design --project
```

---

## 🔗 有用链接

- 🌐 **网站**: [skill4agent.com](https://www.skill4agent.com) - 发现并浏览所有可用 skills
- 📦 **npm 包**: [npmjs.com/package/@skill4agent/cli](https://www.npmjs.com/package/@skill4agent/cli)
- 💻 **GitHub 仓库**: [github.com/osulivan/skill4agent-cli](https://github.com/osulivan/skill4agent-cli)

---

<p align="center">
  用 ❤️ 由 <a href="https://www.skill4agent.com">skill4agent.com</a> 制作
</p>
