import fs from 'fs';
import os from 'os';
import path from 'path';

export interface Agent {
  id: string;
  name: string;
  path: string;
  universal: boolean;
  globalPath?: string;
}

export const UNIVERSAL_AGENTS: Agent[] = [
  { id: 'amp', name: 'Amp', path: '.agents/skills', universal: true },
  { id: 'codex', name: 'Codex', path: '.agents/skills', universal: true },
  { id: 'gemini-cli', name: 'Gemini CLI', path: '.agents/skills', universal: true },
  { id: 'github-copilot', name: 'GitHub Copilot', path: '.agents/skills', universal: true },
  { id: 'kimi-code-cli', name: 'Kimi Code CLI', path: '.agents/skills', universal: true },
  { id: 'opencode', name: 'OpenCode', path: '.agents/skills', universal: true },
];

export const UNIVERSAL_PATH = '.agents/skills';

export const OTHER_AGENTS: Agent[] = [
  { id: 'antigravity', name: 'Antigravity', path: '.agent/skills', universal: false },
  { id: 'augment', name: 'Augment', path: '.augment/rules', universal: false },
  { id: 'claude-code', name: 'Claude Code', path: '.claude/skills', universal: false },
  { id: 'openclaw', name: 'OpenClaw', path: 'skills', universal: false },
  { id: 'cline', name: 'Cline', path: '.cline/skills', universal: false },
  { id: 'codebuddy', name: 'CodeBuddy', path: '.codebuddy/skills', universal: false },
  { id: 'command-code', name: 'Command Code', path: '.commandcode/skills', universal: false },
  { id: 'continue', name: 'Continue', path: '.continue/skills', universal: false },
  { id: 'crush', name: 'Crush', path: '.crush/skills', universal: false },
  { id: 'cursor', name: 'Cursor', path: '.cursor/skills', universal: false },
  { id: 'droid', name: 'Droid', path: '.factory/skills', universal: false },
  { id: 'goose', name: 'Goose', path: '.goose/skills', universal: false },
  { id: 'junie', name: 'Junie', path: '.junie/skills', universal: false },
  { id: 'iflow-cli', name: 'iFlow CLI', path: '.iflow/skills', universal: false },
  { id: 'kilo-code', name: 'Kilo Code', path: '.kilocode/skills', universal: false },
  { id: 'kiro-cli', name: 'Kiro CLI', path: '.kiro/skills', universal: false },
  { id: 'kode', name: 'Kode', path: '.kode/skills', universal: false },
  { id: 'mcpjam', name: 'MCPJam', path: '.mcpjam/skills', universal: false },
  { id: 'mistral-vibe', name: 'Mistral Vibe', path: '.vibe/skills', universal: false },
  { id: 'mux', name: 'Mux', path: '.mux/skills', universal: false },
  { id: 'openhands', name: 'OpenHands', path: '.openhands/skills', universal: false },
  { id: 'pi', name: 'Pi', path: '.pi/skills', universal: false },
  { id: 'qoder', name: 'Qoder', path: '.qoder/skills', universal: false },
  { id: 'qwen-code', name: 'Qwen Code', path: '.qwen/skills', universal: false },
  { id: 'roo-code', name: 'Roo Code', path: '.roo/skills', universal: false },
  { id: 'trae', name: 'Trae', path: '.trae/skills', universal: false },
  { id: 'trae-cn', name: 'Trae CN', path: '.trae/skills', globalPath: '.trae-cn/skills', universal: false },
  { id: 'windsurf', name: 'Windsurf', path: '.windsurf/skills', universal: false },
  { id: 'zencoder', name: 'Zencoder', path: '.zencoder/skills', universal: false },
  { id: 'neovate', name: 'Neovate', path: '.neovate/skills', universal: false },
  { id: 'pochi', name: 'Pochi', path: '.pochi/skills', universal: false },
  { id: 'adal', name: 'AdaL', path: '.adal/skills', universal: false },
];

export function getGlobalStoragePath(): string {
  const platform = os.platform();
  const homeDir = os.homedir();

  switch (platform) {
    case 'win32':
      return path.join(process.env.LOCALAPPDATA || path.join(homeDir, 'AppData', 'Local'), 'skill4agent', 'skills');
    case 'linux':
      return path.join(process.env.XDG_DATA_HOME || path.join(homeDir, '.local', 'share'), 'skill4agent', 'skills');
    case 'darwin':
    default:
      return path.join(homeDir, '.skill4agent', 'skills');
  }
}

export function getAgentPath(agentId: string, isGlobal: boolean): string | null {
  const allAgents = [...UNIVERSAL_AGENTS, ...OTHER_AGENTS];
  const agent = allAgents.find(a => a.id === agentId);
  if (!agent) return null;

  const effectivePath = isGlobal && agent.globalPath ? agent.globalPath : agent.path;

  if (isGlobal) {
    return path.join(os.homedir(), effectivePath);
  } else {
    return path.resolve(process.cwd(), effectivePath);
  }
}

export function checkAgentExists(agentPath: string): boolean {
  const parentDir = path.dirname(agentPath);
  return fs.existsSync(parentDir);
}

export function getAllAgents(): Agent[] {
  return [...UNIVERSAL_AGENTS, ...OTHER_AGENTS];
}

export function getAgentDisplayPath(agentId: string, isGlobal: boolean): string {
  const allAgents = [...UNIVERSAL_AGENTS, ...OTHER_AGENTS];
  const agent = allAgents.find(a => a.id === agentId);
  if (!agent) return 'unknown';

  const effectivePath = isGlobal && agent.globalPath ? agent.globalPath : agent.path;

  if (isGlobal) {
    const homeDir = os.homedir();
    const fullPath = path.join(homeDir, effectivePath);
    return fullPath.replace(os.homedir(), '~');
  } else {
    return effectivePath;
  }
}
