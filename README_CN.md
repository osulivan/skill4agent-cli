# skill4agent CLI

由skill4agent.com提供的一个用于安装 Agent Skills 的命令行工具。

[![skill4agent 网站首页](./assets/skill4agent_zh.png)](https://www.skill4agent.com)

[English](README.md) | [中文](README_CN.md)

## 快速开始

> 💡 在 [skill4agent.com](https://skill4agent.com) 查找可用技能
> - `<源仓库>`: 源仓库名称（如 `anthropics/skills`）
> - `<技能名>`: 技能名称（如 `frontend-design`）

```bash
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
