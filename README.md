# skill4agent CLI

By skill4agent.com, a command-line tool for installing Agent Skills.

[![skill4agent website](./assets/skill4agent_en.png)](https://www.skill4agent.com)

[English](README.md) | [中文](README_CN.md)

## Quick Start

> 💡 Find available skills at [skill4agent.com](https://skill4agent.com)
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
