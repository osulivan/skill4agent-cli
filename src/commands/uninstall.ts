import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { getSkillScopes, removeSkillByScope, removeSkill, isGlobalScope, InstalledSkill } from '../index-manager';

interface UninstallOptions {
  global?: boolean;
  project?: boolean;
}

function removeDirectory(dirPath: string): boolean {
  try {
    if (fs.existsSync(dirPath)) {
      fs.removeSync(dirPath);
      console.log(chalk.green(`✅ Removed: ${dirPath}`));
      return true;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Failed to remove: ${dirPath}`));
  }
  return false;
}

function uninstallScope(skill: InstalledSkill): number {
  let removedCount = 0;

  // Remove symlink directories
  for (const linkPath of skill.locations.symlink) {
    if (removeDirectory(linkPath)) {
      removedCount++;
    }
  }

  // Remove copy directories
  for (const copyPath of skill.locations.copy) {
    if (removeDirectory(copyPath)) {
      removedCount++;
    }
  }

  // Remove main directory
  if (removeDirectory(skill.locations.universal)) {
    removedCount++;
  }

  return removedCount;
}

export async function uninstall(skillName: string, options: UninstallOptions = {}): Promise<void> {
  const scopes = getSkillScopes(skillName);

  if (scopes.length === 0) {
    console.log(chalk.red(`\n❌  Skill "${skillName}" not found in installed skills.`));
    console.log(chalk.gray('   Use "skill4agent list" to see installed skills.\n'));
    return;
  }

  // Determine the scope to uninstall
  let targetScopes: InstalledSkill[] = [];

  if (options.global && options.project) {
    console.log(chalk.red('\n❌ Cannot use both --global and --project at the same time.\n'));
    return;
  }

  if (options.global) {
    // Only uninstall global
    targetScopes = scopes.filter(s => isGlobalScope(s.scope));
    if (targetScopes.length === 0) {
      console.log(chalk.yellow(`\n⚠️  "${skillName}" is not installed globally.`));
      console.log(chalk.gray(`   It's only installed in projects.\n`));
      return;
    }
  } else if (options.project) {
    // Uninstall all projects (non-global)
    targetScopes = scopes.filter(s => !isGlobalScope(s.scope));
    if (targetScopes.length === 0) {
      console.log(chalk.yellow(`\n⚠️  "${skillName}" is not installed in any project.`));
      console.log(chalk.gray(`   It's only installed globally.\n`));
      return;
    }
  } else {
    // Default: uninstall all
    targetScopes = scopes;
  }

  console.log(chalk.blue(`\n📦 Uninstalling skill: ${skillName}`));

  // Show scopes to be uninstalled
  console.log(chalk.yellow('\n⚠️  This will remove the following installations:'));
  for (const scope of targetScopes) {
    const scopeType = isGlobalScope(scope.scope) ? 'Global' : `Project (${scope.scope})`;
    console.log(chalk.gray(`   [${scopeType}]`));
    console.log(chalk.gray(`     ${scope.locations.universal}`));
    for (const link of scope.locations.symlink) {
      console.log(chalk.gray(`     ${link} (symlink)`));
    }
    for (const copy of scope.locations.copy) {
      console.log(chalk.gray(`     ${copy} (copy)`));
    }
  }
  console.log();

  const { confirm } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `Are you sure you want to uninstall ${targetScopes.length} installation${targetScopes.length > 1 ? 's' : ''}?`,
    default: false,
  });

  if (!confirm) {
    console.log(chalk.yellow('\n⚠️  Uninstallation cancelled.\n'));
    return;
  }

  // Execute uninstall operation
  let totalRemoved = 0;
  for (const scope of targetScopes) {
    const removed = uninstallScope(scope);
    totalRemoved += removed;
    removeSkillByScope(skillName, scope.scope);
  }

  // Check if there are remaining scopes
  const remainingScopes = getSkillScopes(skillName);
  if (remainingScopes.length === 0) {
    console.log(chalk.green(`\n🎉 Successfully uninstalled "${skillName}" completely (${totalRemoved} item${totalRemoved > 1 ? 's' : ''} removed).\n`));
  } else {
    const remainingTypes = remainingScopes.map(s => isGlobalScope(s.scope) ? 'Global' : 'Project').join(', ');
    console.log(chalk.green(`\n🎉 Uninstalled ${targetScopes.length} scope(s) (${totalRemoved} item${totalRemoved > 1 ? 's' : ''} removed).`));
    console.log(chalk.gray(`   Remaining: ${remainingScopes.length} scope(s) (${remainingTypes})\n`));
  }
}
