# skill4agent CLI

[![npm version](https://img.shields.io/npm/v/@skill4agent/cli.svg)](https://www.npmjs.com/package/@skill4agent/cli)
[![npm downloads](https://img.shields.io/npm/dm/@skill4agent/cli.svg)](https://www.npmjs.com/package/@skill4agent/cli)
[![GitHub stars](https://img.shields.io/github/stars/osulivan/skill4agent-cli.svg)](https://github.com/osulivan/skill4agent-cli)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> 🚀 **The easiest way to install and manage Agent Skills for AI coding assistants**

By [skill4agent.com](https://www.skill4agent.com) - A command-line tool for installing Agent Skills.

[![skill4agent website](https://raw.githubusercontent.com/osulivan/skill4agent-cli/main/assets/skill4agent_en.png)](https://www.skill4agent.com)

[English](https://github.com/osulivan/skill4agent-cli/blob/main/README.md) | [中文](https://github.com/osulivan/skill4agent-cli/blob/main/README_CN.md)

---

## 🌟 Why skill4agent?

- **🎯 Curated Skills**: Access a vast collection of high-quality skills from [skill4agent.com](https://www.skill4agent.com)
- **🌐 Bilingual Support**: Every skill includes both English and Chinese translations, breaking language barriers
- **✅ Quality Assurance**: Automated script detection ensures all skills are safe and reliable
- **🏷️ Smart Categorization**: Fine-grained categories and tags help you quickly find the right skill
- **🤖 AI-Optimized**: Tags are embedded in SKILL.md, enabling AI Agents to match your needs more accurately
- **⚡ One-Command Install**: Install any skill to multiple IDEs with a single command
- **🔧 Multi-IDE Support**: Works with Trae, Cursor, Claude, OpenCode, OpenClaw, and more
- **🌍 Global & Project Installation**: Install globally or per-project
- **📦 Smart Management**: List and uninstall skills easily

---

## Installation

```bash
# Using npx (recommended - no installation required)
npx skill4agent <command>

# Or install globally
npm install -g @skill4agent/cli
```

> 💡 Find available skills at [skill4agent.com](https://www.skill4agent.com)
> - `<source>`: The source repository (e.g., `anthropics/skills`)
> - `<skill>`: The skill name (e.g., `frontend-design`)

```bash
# Interactive installation (recommended for beginners)
npx skill4agent add <source> <skill>

# Non-interactive installation (for scripts and AI automation)
npx skill4agent install <source> <skill> [options]

# List installed skills
npx skill4agent list

# Uninstall a skill
npx skill4agent uninstall <skill>
```

## Commands

### `search` - Search Online Skills

Search for skills in the skill registry.

```bash
npx skill4agent search <keyword> [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-l, --limit` | Number of results to return | 10 |

**Output fields:**
- **source**: Repository source (e.g., `vercel-labs-agent-skills`)
- **skill_name**: Skill name
- **category**: Skill category
- **description**: Full skill description
- **tags**: Skill tags
- **installs**: Total installation count

### `add` - Interactive Installation

Interactive installation with prompts for configuration options.

```bash
npx skill4agent add <source> <skill>
```

### `install` - Non-interactive Installation

For scripts and AI automation with explicit options.

```bash
npx skill4agent install <source> <skill> [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--type` | `original` or `translated` | original |
| `--global` | Install globally (available to all projects) | project dir |
| `--dirs` | Installation directories (comma-separated): `.trae,.cursor` | `.agents` only |
| `--method` | `symlink` or `copy` | symlink |

### `list` - List Installed Skills

Display all installed skills with their installation details.

```bash
npx skill4agent list
```

**Output columns:**
- **Name**: Skill name
- **Source**: Repository source (e.g., `anthropics/skills`)
- **Scope**: Installation scope (`Global`, `Project`, or `Global,Project`)
- **Installed**: Installation date

### `uninstall` - Uninstall a Skill

Remove an installed skill.

```bash
# Uninstall from all scopes (global and all projects)
npx skill4agent uninstall <skill>

# Uninstall from global only
npx skill4agent uninstall <skill> --global

# Uninstall from all projects only (non-global installations)
npx skill4agent uninstall <skill> --project
```

## Examples

### Installation Examples

```bash
# Minimal: install with all defaults
npx skill4agent install anthropics/skills frontend-design

# Install to specific directories (comma-separated)
npx skill4agent install anthropics/skills frontend-design --dirs ".trae,.cursor"

# Global installation (available to all projects)
npx skill4agent install anthropics/skills frontend-design --global

# Full options
npx skill4agent install anthropics/skills frontend-design \
  --type original \
  --global \
  --dirs ".trae,.cursor" \
  --method symlink
```

### List Example

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

### Uninstall Examples

```bash
# Uninstall completely (all scopes)
npx skill4agent uninstall frontend-design

# Uninstall from global only
npx skill4agent uninstall frontend-design --global

# Uninstall from all projects only
npx skill4agent uninstall frontend-design --project
```

---

## 🔗 Useful Links

- 🌐 **Website**: [skill4agent.com](https://www.skill4agent.com) - Discover and browse all available skills
- 📦 **npm Package**: [npmjs.com/package/@skill4agent/cli](https://www.npmjs.com/package/@skill4agent/cli)
- 💻 **GitHub Repository**: [github.com/osulivan/skill4agent-cli](https://github.com/osulivan/skill4agent-cli)

---

<p align="center">
  Made with ❤️ by <a href="https://www.skill4agent.com">skill4agent.com</a>
</p>
