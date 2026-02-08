import chalk from 'chalk';
import { getAllSkills, isGlobalScope, InstalledSkill } from '../index-manager';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

function getScopeDisplay(scopes: InstalledSkill[]): string {
  const hasGlobal = scopes.some(s => isGlobalScope(s.scope));
  const hasProject = scopes.some(s => !isGlobalScope(s.scope));
  
  if (hasGlobal && hasProject) {
    return 'Global,Project';
  } else if (hasGlobal) {
    return 'Global';
  } else {
    return 'Project';
  }
}

export async function list(): Promise<void> {
  const allSkills = getAllSkills();

  if (allSkills.length === 0) {
    console.log(chalk.gray('\nNo installed skills found.\n'));
    console.log(chalk.gray('Use "npx skill4agent add <source> <skill>" to install.\n'));
    return;
  }

  // Sort by name
  allSkills.sort((a, b) => a.name.localeCompare(b.name));

  // Calculate total installations
  const totalInstalls = allSkills.reduce((sum, skill) => sum + skill.scopes.length, 0);

  console.log(chalk.blue(`\n📦 Installed Skills (${allSkills.length} skills, ${totalInstalls} installs)`));
  console.log(chalk.gray('─'.repeat(80)));

  // Table header
  const nameWidth = 25;
  const sourceWidth = 25;
  const scopeWidth = 15;

  console.log(
    chalk.bold(
      `${'Name'.padEnd(nameWidth)} ${'Source'.padEnd(sourceWidth)} ${'Scope'.padEnd(scopeWidth)} Installed`
    )
  );
  console.log(chalk.gray('─'.repeat(80)));

  // Data rows
  for (const { name, scopes } of allSkills) {
    // Sort by time descending, get the latest installation
    const latestScope = [...scopes].sort((a, b) =>
      new Date(b.installedAt).getTime() - new Date(a.installedAt).getTime()
    )[0];
    
    const nameStr = truncate(name, nameWidth).padEnd(nameWidth);
    const sourceStr = truncate(latestScope.source, sourceWidth).padEnd(sourceWidth);
    const scopeStr = getScopeDisplay(scopes).padEnd(scopeWidth);
    const dateStr = formatDate(latestScope.installedAt);

    console.log(`${nameStr} ${sourceStr} ${scopeStr} ${dateStr}`);
  }

  console.log(chalk.gray('─'.repeat(80)));
  console.log(chalk.gray(`\nTotal: ${allSkills.length} skill${allSkills.length > 1 ? 's' : ''} (${totalInstalls} install${totalInstalls > 1 ? 's' : ''})\n`));
}

export async function search(query: string): Promise<void> {
  console.log('search command', query);
}

export async function update(skillName?: string): Promise<void> {
  console.log('update command', skillName);
}

export async function uninstall(skillName: string): Promise<void> {
  console.log('uninstall command', skillName);
}
