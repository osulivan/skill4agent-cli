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
  scope: string;  // Project path or "global"
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

// Old version data structure (for backward compatibility)
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
    // Determine if it's global or project
    const isGlobal = skill.locations.universal.startsWith(path.join(os.homedir(), '.agents'));
    const scope = isGlobal ? 'global' : process.cwd();

    // Convert old data to new format
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
    
    // Check if it's old format (object values are not arrays)
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
    // Merge locations instead of overwriting
    const existing = index[skill.name][existingIndex];

    // Merge universal path (if different)
    if (existing.locations.universal !== skill.locations.universal) {
      // If universal paths are different, handle specially
      // This shouldn't normally happen, but just in case, keep the new one
      existing.locations.universal = skill.locations.universal;
    }

    // Merge symlink directories (deduplicate and remove from copy)
    for (const link of skill.locations.symlink) {
      // Skip if already in symlink
      if (existing.locations.symlink.includes(link)) {
        continue;
      }
      // If previously in copy, remove from copy and add to symlink
      const copyIndex = existing.locations.copy.indexOf(link);
      if (copyIndex >= 0) {
        existing.locations.copy.splice(copyIndex, 1);
      }
      existing.locations.symlink.push(link);
    }

    // Merge copy directories (deduplicate and remove from symlink)
    for (const copy of skill.locations.copy) {
      // Skip if already in copy
      if (existing.locations.copy.includes(copy)) {
        continue;
      }
      // If previously in symlink, remove from symlink and add to copy
      const symlinkIndex = existing.locations.symlink.indexOf(copy);
      if (symlinkIndex >= 0) {
        existing.locations.symlink.splice(symlinkIndex, 1);
      }
      existing.locations.copy.push(copy);
    }

    // Update installation time (take the latest)
    if (new Date(skill.installedAt) > new Date(existing.installedAt)) {
      existing.installedAt = skill.installedAt;
    }

    // Update source (if changed)
    if (skill.source !== existing.source) {
      existing.source = skill.source;
    }
  } else {
    // Add new scope
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

  // If no scopes left, delete the entire skill
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
