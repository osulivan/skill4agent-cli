import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import os from 'os';
import path from 'path';
import { extractZip } from '../utils';
import { UNIVERSAL_AGENTS, OTHER_AGENTS, UNIVERSAL_PATH, getAgentDisplayPath } from '../tools';
import { downloadSkill, getSkillInfo, incrementInstallCount, SkillInfo } from '../api';
import { addOrUpdateSkill, createSkillMetadata, writeSkillMetadata, getCurrentScope } from '../index-manager';

function getAgentName(id: string): string {
  const agent = [...UNIVERSAL_AGENTS, ...OTHER_AGENTS].find(a => a.id === id);
  return agent?.name || id;
}

async function promptTypeSelection(skillInfo: SkillInfo): Promise<'original' | 'translated'> {
  const isOriginalEnglish = skillInfo.originalLanguage === 'en';
  const originalName = isOriginalEnglish ? 'English' : 'Chinese';
  const translatedName = isOriginalEnglish ? 'Chinese' : 'English';

  if (!skillInfo.hasTranslation) {
    console.log(chalk.yellow(`\nℹ️  This skill does not have a ${translatedName} translation yet.`));
    console.log(chalk.gray(`   Installing ${originalName} version...\n`));
    return 'original';
  }

  const { type } = await inquirer.prompt({
    type: 'list',
    name: 'type',
    message: `Select version for "${skillInfo.skillName}"`,
    choices: [
      {
        name: `${originalName} (Original)`,
        value: 'original',
      },
      {
        name: `${translatedName} (Translation)`,
        value: 'translated',
      },
    ],
    default: 'original',
  });

  return type;
}

async function promptScopeSelection(): Promise<'project' | 'global'> {
  const { scope } = await inquirer.prompt({
    type: 'list',
    name: 'scope',
    message: 'Installation scope',
    choices: [
      {
        name: 'Project (Install in current directory (committed with your project))',
        value: 'project',
      },
      {
        name: 'Global (Install in home directory (available across all projects))',
        value: 'global',
      },
    ],
    default: 'project',
  });

  return scope;
}

async function promptAgentSelection(isGlobal: boolean): Promise<string[]> {
  const universalNames = UNIVERSAL_AGENTS.map(a => a.name).join(', ');
  const universalDisplayPath = getAgentDisplayPath(UNIVERSAL_AGENTS[0].id, isGlobal);

  const otherAgentChoices = OTHER_AGENTS.map(agent => ({
    name: `${agent.name} (${getAgentDisplayPath(agent.id, isGlobal)})`,
    value: agent.id,
  }));

  console.log(chalk.green(`✓ Universal (${universalDisplayPath}): ${universalNames} is always included`));

  const { selectedOtherAgents } = await inquirer.prompt({
    type: 'checkbox',
    name: 'selectedOtherAgents',
    message: 'Select additional agents:',
    pageSize: 12,
    loop: false,
    choices: otherAgentChoices,
  });

  const selectedNames = (selectedOtherAgents as string[]).map(id =>
    OTHER_AGENTS.find(a => a.id === id)?.name || id
  );
  const displayNames = selectedNames.length > 0
    ? ['Universal', ...selectedNames].join(', ')
    : 'Universal';
  console.log(chalk.green(`✓ Selected: ${displayNames}\n`));

  const universalAgentIds = UNIVERSAL_AGENTS.map(a => a.id);
  return [...universalAgentIds, ...(selectedOtherAgents as string[])];
}

async function promptMethodSelection(): Promise<'symlink' | 'copy'> {
  const { method } = await inquirer.prompt({
    type: 'list',
    name: 'method',
    message: 'Installation method',
    choices: [
      {
        name: 'Symlink (Recommended) (Single source of truth, easy updates)',
        value: 'symlink',
      },
      {
        name: 'Copy to all agents (Independent copies for each agent)',
        value: 'copy',
      },
    ],
    default: 'symlink',
  });

  return method;
}

function displaySummary(
  skillName: string,
  source: string,
  typeDisplay: string,
  scope: string,
  agents: string[],
  method: string
): void {
  const universalAgentIds = UNIVERSAL_AGENTS.map(a => a.id);
  const hasUniversal = agents.some(id => universalAgentIds.includes(id));
  const otherAgents = agents.filter(id => !universalAgentIds.includes(id));
  const otherAgentNames = otherAgents.map(id => getAgentName(id));

  const agentDisplay = hasUniversal
    ? ['Universal', ...otherAgentNames].join(', ')
    : otherAgentNames.join(', ');
  const agentCount = (hasUniversal ? 1 : 0) + otherAgentNames.length;

  console.log(chalk.blue('\n📊 Installation Summary'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`Skill: ${chalk.white(skillName)}`);
  console.log(`Source: ${source}`);
  console.log(`Type: ${typeDisplay}`);
  console.log(`Scope: ${scope === 'global' ? 'Global' : 'Project'}`);
  console.log(`Agents (${agentCount}): ${agentDisplay}`);
  console.log(`Method: ${method === 'symlink' ? 'Symlink (Recommended)' : 'Copy'}`);
  console.log(chalk.gray('─'.repeat(50)));
}

async function promptConfirmation(): Promise<boolean> {
  const { confirm } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'Proceed with installation?',
    default: true,
  });

  return confirm;
}

export async function add(topSource: string, skillName: string): Promise<void> {
  console.log(chalk.blue(`\n📦 Installing skill: ${skillName}`));
  console.log(chalk.gray(`   Source: ${topSource}\n`));

  let result: { skill: SkillInfo | null; sourceExists: boolean };
  try {
    result = await getSkillInfo(topSource, skillName);
  } catch (error: any) {
    console.log(chalk.red(`\n❌  Skill "${skillName}" not found in source "${topSource}".`));
    console.log(chalk.gray(`   Please check the source repository and skill name.\n`));
    return;
  }

  if (!result.skill) {
    console.log(chalk.red(`\n❌  Skill "${skillName}" not found in source "${topSource}".`));
    console.log(chalk.gray(`   Please check the source repository and skill name.\n`));
    return;
  }

  const skillInfo = result.skill;

  console.log(chalk.blue(`\n📦 Skill: ${chalk.white(skillInfo.skillName)}`));
  console.log(chalk.gray(`   Category: ${skillInfo.category?.nameEn || 'N/A'} | Installs: ${skillInfo.totalInstalls}`));

  if (skillInfo.tags) {
    console.log(chalk.gray(`   Tags: ${skillInfo.tags}`));
  }

  if (!skillInfo.hasScript) {
    console.log(chalk.gray(`   📜 Scripts: No scripts`));
  } else {
    const statusText = skillInfo.scriptCheckResult === 'safe' ? '✅ Check passed' : '⚠️ Needs attention';
    console.log(chalk.gray(`   📜 Scripts: ${skillInfo.scriptCount} script(s) - ${statusText}`));
  }

  console.log(chalk.gray(`   ${skillInfo.hasTranslation ? '✅' : '❌'} Translation available\n`));

  const type = await promptTypeSelection(skillInfo);

  const isOriginalEnglish = skillInfo.originalLanguage === 'en';
  const typeDisplay = type === 'original'
    ? (isOriginalEnglish ? 'English' : 'Chinese')
    : (isOriginalEnglish ? 'Chinese' : 'English');
  console.log(chalk.gray(`   Type: ${typeDisplay}\n`));

  const scope = await promptScopeSelection();
  const isGlobal = scope === 'global';

  const selectedAgentIds = await promptAgentSelection(isGlobal);
  if (selectedAgentIds.length === 0) {
    console.log(chalk.yellow('\n⚠️  No agents selected. Installation cancelled.'));
    return;
  }

  const installMethod = await promptMethodSelection();

  displaySummary(skillName, topSource, typeDisplay, scope, selectedAgentIds, installMethod);

  const confirmed = await promptConfirmation();
  if (!confirmed) {
    console.log(chalk.yellow('\n⚠️  Installation cancelled.'));
    return;
  }

  const basePath = isGlobal ? os.homedir() : process.cwd();

  let tempZip: string;
  try {
    tempZip = await downloadSkill(topSource, skillName, type);
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(chalk.red(`\n❌  Failed to download skill "${skillName}".`));
      console.log(chalk.gray(`   The skill may not exist or the download link is invalid.\n`));
      return;
    }
    console.log(chalk.red(`\n❌  Download failed: ${error.message}`));
    return;
  }

  if (installMethod === 'symlink') {
    const universalFullPath = path.join(basePath, UNIVERSAL_PATH);
    fs.ensureDirSync(universalFullPath);
    const skillDir = path.join(universalFullPath, skillName);

    if (fs.existsSync(skillDir)) {
      console.log(chalk.yellow(`\n⚠️  Skill "${skillName}" already exists. Overwriting...`));
      fs.removeSync(skillDir);
    }

    await extractZip(tempZip, universalFullPath);
    fs.removeSync(tempZip);

    console.log(chalk.green(`✅ Installed to: ${skillDir}`));

    const otherAgentIds = selectedAgentIds.filter(id => !UNIVERSAL_AGENTS.some(a => a.id === id));

    for (const agentId of otherAgentIds) {
      const agent = OTHER_AGENTS.find(a => a.id === agentId);
      if (!agent) continue;
      const effectivePath = isGlobal && agent.globalPath ? agent.globalPath : agent.path;
      const agentPath = path.join(basePath, effectivePath);
      fs.ensureDirSync(agentPath);
      const destDir = path.join(agentPath, skillName);
      if (fs.existsSync(destDir)) {
        fs.removeSync(destDir);
      }

      if (isGlobal) {
        fs.symlinkSync(skillDir, destDir);
      } else {
        const relativePath = path.relative(agentPath, skillDir);
        fs.symlinkSync(relativePath, destDir);
      }

      console.log(chalk.green(`✅ Linked to: ${destDir}`));
    }
  } else {
    const universalFullPath = path.join(basePath, UNIVERSAL_PATH);
    fs.ensureDirSync(universalFullPath);

    if (fs.existsSync(path.join(universalFullPath, skillName))) {
      fs.removeSync(path.join(universalFullPath, skillName));
    }

    await extractZip(tempZip, universalFullPath);
    fs.removeSync(tempZip);

    console.log(chalk.green(`✅ Copied to: ${universalFullPath}`));

    let copiedCount = 0;
    const otherAgentIds = selectedAgentIds.filter(id => !UNIVERSAL_AGENTS.some(a => a.id === id));

    for (const agentId of otherAgentIds) {
      const agent = OTHER_AGENTS.find(a => a.id === agentId);
      if (!agent) continue;
      const effectivePath = isGlobal && agent.globalPath ? agent.globalPath : agent.path;
      const agentPath = path.join(basePath, effectivePath);
      fs.ensureDirSync(agentPath);
      const destDir = path.join(agentPath, skillName);

      if (fs.existsSync(destDir)) {
        fs.removeSync(destDir);
      }

      fs.copySync(path.join(universalFullPath, skillName), destDir);
      console.log(chalk.green(`✅ Copied to: ${destDir}`));
      copiedCount++;
    }
  }

  // Update installation count
  await incrementInstallCount(topSource, skillName);

  // Record installation info to index
  const installScope = isGlobal ? 'global' : getCurrentScope();
  const skillDir = path.join(basePath, UNIVERSAL_PATH, skillName);
  
  // Collect symlink and copy directories
  const symlinkDirs: string[] = [];
  const copyDirs: string[] = [];
  
  const otherAgentIds = selectedAgentIds.filter(id => !UNIVERSAL_AGENTS.some(a => a.id === id));
  for (const agentId of otherAgentIds) {
    const agent = OTHER_AGENTS.find(a => a.id === agentId);
    if (!agent) continue;
    const effectivePath = isGlobal && agent.globalPath ? agent.globalPath : agent.path;
    const agentPath = path.join(basePath, effectivePath);
    const destDir = path.join(agentPath, skillName);
    
    if (installMethod === 'symlink') {
      symlinkDirs.push(destDir);
    } else {
      copyDirs.push(destDir);
    }
  }

  const metadata = createSkillMetadata(skillName, topSource, installScope);
  writeSkillMetadata(skillDir, metadata);

  addOrUpdateSkill({
    name: skillName,
    source: topSource,
    installedAt: metadata.installedAt,
    scope: installScope,
    locations: {
      universal: skillDir,
      symlink: symlinkDirs,
      copy: copyDirs,
    },
  });

  console.log(chalk.green('\n🎉 Installation completed!\n'));
}
