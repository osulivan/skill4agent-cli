import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const SKILL4AGENT_DIR = path.join(os.homedir(), '.skill4agent');
const INDEX_FILE = path.join(SKILL4AGENT_DIR, 'installed-skills.json');

export interface SkillLocation {
  universal: string;
  symlink: string[];
  copy: string[];
}

export interface InstalledSkill {
  name: string;
  source: string;
  installedAt: string;
  scope: string;  // 项目路径或 "global"
  locations: SkillLocation;
}

export interface SkillMetadata {
  name: string;
  source: string;
  installedAt: string;
  scope: string;
}

function ensureSkill4AgentDir(): void {
  if (!fs.existsSync(SKILL4AGENT_DIR)) {
    fs.mkdirSync(SKILL4AGENT_DIR, { recursive: true });
  }
}

// 旧版本数据结构（兼容用）
interface OldInstalledSkill {
  name: string;
  source: string;
  installedAt: string;
  method: 'symlink' | 'copy';
  type: 'original' | 'translated';
  locations: {
    universal: string;
    links: string[];
  };
}

function migrateOldData(oldData: Record<string, OldInstalledSkill>): Record<string, InstalledSkill[]> {
  const newData: Record<string, InstalledSkill[]> = {};
  
  for (const [skillName, skill] of Object.entries(oldData)) {
    // 判断是 global 还是 project
    const isGlobal = skill.locations.universal.startsWith(path.join(os.homedir(), '.agents'));
    const scope = isGlobal ? 'global' : process.cwd();
    
    // 将旧数据转换为新格式
    newData[skillName] = [{
      name: skill.name,
      source: skill.source,
      installedAt: skill.installedAt,
      scope: scope,
      locations: {
        universal: skill.locations.universal,
        symlink: skill.method === 'symlink' ? skill.locations.links : [],
        copy: skill.method === 'copy' ? skill.locations.links : [],
      },
    }];
  }
  
  return newData;
}

export function readIndex(): Record<string, InstalledSkill[]> {
  ensureSkill4AgentDir();

  if (!fs.existsSync(INDEX_FILE)) {
    return {};
  }

  try {
    const content = fs.readFileSync(INDEX_FILE, 'utf-8');
    const data = JSON.parse(content);
    
    // 检查是否是旧格式（对象值不是数组）
    const isOldFormat = Object.values(data).some(val => !Array.isArray(val));
    
    if (isOldFormat) {
      console.log(chalk.yellow('⚠️  Migrating old index format to new format...'));
      const migrated = migrateOldData(data as Record<string, OldInstalledSkill>);
      writeIndex(migrated);
      return migrated;
    }
    
    return data as Record<string, InstalledSkill[]>;
  } catch {
    return {};
  }
}

export function writeIndex(index: Record<string, InstalledSkill[]>): void {
  ensureSkill4AgentDir();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

export function getSkillScopes(skillName: string): InstalledSkill[] {
  const index = readIndex();
  return index[skillName] || [];
}

export function getSkillByScope(skillName: string, scope: string): InstalledSkill | null {
  const scopes = getSkillScopes(skillName);
  return scopes.find(s => s.scope === scope) || null;
}

export function addOrUpdateSkill(skill: InstalledSkill): void {
  const index = readIndex();

  if (!index[skill.name]) {
    index[skill.name] = [];
  }

  const existingIndex = index[skill.name].findIndex(s => s.scope === skill.scope);
  if (existingIndex >= 0) {
    // 合并 locations，而不是覆盖
    const existing = index[skill.name][existingIndex];

    // 合并 universal 路径（如果不同）
    if (existing.locations.universal !== skill.locations.universal) {
      // 如果 universal 路径不同，需要特殊处理
      // 这种情况通常不应该发生，但以防万一，我们保留新的
      existing.locations.universal = skill.locations.universal;
    }

    // 合并 symlink 目录（去重，同时从 copy 中移除）
    for (const link of skill.locations.symlink) {
      // 如果已经在 symlink 中，跳过
      if (existing.locations.symlink.includes(link)) {
        continue;
      }
      // 如果之前在 copy 中，从 copy 移除并添加到 symlink
      const copyIndex = existing.locations.copy.indexOf(link);
      if (copyIndex >= 0) {
        existing.locations.copy.splice(copyIndex, 1);
      }
      existing.locations.symlink.push(link);
    }

    // 合并 copy 目录（去重，同时从 symlink 中移除）
    for (const copy of skill.locations.copy) {
      // 如果已经在 copy 中，跳过
      if (existing.locations.copy.includes(copy)) {
        continue;
      }
      // 如果之前在 symlink 中，从 symlink 移除并添加到 copy
      const symlinkIndex = existing.locations.symlink.indexOf(copy);
      if (symlinkIndex >= 0) {
        existing.locations.symlink.splice(symlinkIndex, 1);
      }
      existing.locations.copy.push(copy);
    }

    // 更新安装时间（取最新的）
    if (new Date(skill.installedAt) > new Date(existing.installedAt)) {
      existing.installedAt = skill.installedAt;
    }

    // 更新 source（如果有变化）
    if (skill.source !== existing.source) {
      existing.source = skill.source;
    }
  } else {
    // 添加新的 scope
    index[skill.name].push(skill);
  }

  writeIndex(index);
}

export function removeSkillByScope(skillName: string, scope: string): void {
  const index = readIndex();
  
  if (!index[skillName]) {
    return;
  }
  
  index[skillName] = index[skillName].filter(s => s.scope !== scope);
  
  // 如果没有 scope 了，删除整个 skill
  if (index[skillName].length === 0) {
    delete index[skillName];
  }
  
  writeIndex(index);
}

export function removeSkill(skillName: string): void {
  const index = readIndex();
  delete index[skillName];
  writeIndex(index);
}

export function getAllSkills(): Array<{ name: string; scopes: InstalledSkill[] }> {
  const index = readIndex();
  return Object.entries(index).map(([name, scopes]) => ({ name, scopes }));
}

export function isGlobalScope(scope: string): boolean {
  return scope === 'global';
}

export function getCurrentScope(): string {
  return process.cwd();
}

export function createSkillMetadata(
  skillName: string,
  source: string,
  scope: string
): SkillMetadata {
  return {
    name: skillName,
    source,
    installedAt: new Date().toISOString(),
    scope,
  };
}

export function writeSkillMetadata(skillDir: string, metadata: SkillMetadata): void {
  const metaPath = path.join(skillDir, '.skill4agent.json');
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
}

export function readSkillMetadata(skillDir: string): SkillMetadata | null {
  const metaPath = path.join(skillDir, '.skill4agent.json');
  if (!fs.existsSync(metaPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  } catch {
    return null;
  }
}
