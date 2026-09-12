import chalk from 'chalk';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { extractZip } from '../utils';
import { UNIVERSAL_PATH, getAgentDisplayPath } from '../tools';
import { downloadSkill, getSkillInfo, incrementInstallCount } from '../api';
import { addOrUpdateSkill, createSkillMetadata, writeSkillMetadata, getCurrentScope } from '../index-manager';

interface InstallOptions {
  topSource: string;
  skillName: string;
  type: 'original' | 'translated';
  global: boolean;
  dirs: string[];
  method: 'symlink' | 'copy';
}

function getAgentNameFromPath(dirPath: string): string {
  const name = path.basename(dirPath);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getAgentDisplayName(dirPath: string): string {
  const dirname = path.basename(path.dirname(dirPath));
  if (dirname === '.agents') return 'Universal';
  return dirname.charAt(0).toUpperCase() + dirname.slice(1);
}

function displaySummary(options: InstallOptions, skillInfo: any, typeDisplay: string, allDirs: string[]): void {
  const dirNames = allDirs.map(d => getAgentDisplayName(d));
  const dirCount = allDirs.length;

  console.log(chalk.blue('\n📊 Installation Summary'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`Skill: ${chalk.white(skillInfo.skillName)}`);
  console.log(`Source: ${options.topSource}`);
  console.log(`Type: ${typeDisplay}`);
  console.log(`Scope: ${options.global ? 'Global' : 'Project'}`);
  console.log(`Dirs (${dirCount}): ${dirNames.join(', ')}`);
  console.log(`Method: ${options.method === 'symlink' ? 'Symlink (Recommended)' : 'Copy'}`);
  console.log(chalk.gray('─'.repeat(50)));
}

export async function install(options: InstallOptions): Promise<void> {
  const { topSource, skillName, type, global, dirs, method } = options;

  console.log(chalk.blue(`\n📦 Installing skill: ${skillName}`));
  console.log(chalk.gray(`   Source: ${topSource}\n`));

  let result: { skill: any; sourceExists: boolean };
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

  let finalType = type;
  const isOriginalEnglish = skillInfo.originalLanguage === 'en';

  if (type === 'translated' && !skillInfo.hasTranslation) {
    console.log(chalk.yellow(`⚠️  Translation not available. Using original (${isOriginalEnglish ? 'English' : 'Chinese'}) version.\n`));
    finalType = 'original';
  }

  const typeDisplay = finalType === 'original'
    ? (isOriginalEnglish ? 'English' : 'Chinese')
    : (isOriginalEnglish ? 'Chinese' : 'English');
  console.log(chalk.gray(`   Type: ${typeDisplay}\n`));

  const isGlobal = global;
  const basePath = isGlobal ? os.homedir() : process.cwd();

  const allDirs = [UNIVERSAL_PATH, ...dirs.map((d: string) => d.endsWith('/skills') ? d : `${d}/skills`)];
  const dirNames = allDirs.map(d => getAgentDisplayName(d));
  console.log(chalk.green(`✓ Directories: ${dirNames.join(', ')}`));

  if (allDirs.length === 0) {
    console.log(chalk.yellow('\n⚠️  No directories selected. Installation cancelled.'));
    return;
  }

  displaySummary({ topSource, skillName, type: finalType, global, dirs, method }, skillInfo, typeDisplay, allDirs);

  let tempZip: string;
  try {
    tempZip = await downloadSkill(topSource, skillName, finalType);
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(chalk.red(`\n❌  Failed to download skill "${skillName}".`));
      console.log(chalk.gray(`   The skill may not exist or the download link is invalid.\n`));
      return;
    }
    console.log(chalk.red(`\n❌  Download failed: ${error.message}`));
    return;
  }

  if (method === 'symlink') {
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

    for (const dir of dirs) {
      const fullDir = dir.endsWith('/skills') ? dir : `${dir}/skills`;
      const dirPath = path.join(basePath, fullDir);
      fs.ensureDirSync(dirPath);
      const destDir = path.join(dirPath, skillName);
      if (fs.existsSync(destDir)) {
        fs.removeSync(destDir);
      }

      if (isGlobal) {
        fs.symlinkSync(skillDir, destDir);
      } else {
        const relativePath = path.relative(dirPath, skillDir);
        fs.symlinkSync(relativePath, destDir);
      }

      console.log(chalk.green(`✅ Linked to: ${destDir}`));
    }
  } else {
    const universalFullPath = path.join(basePath, UNIVERSAL_PATH);
    const skillDir = path.join(universalFullPath, skillName);
    fs.ensureDirSync(universalFullPath);

    if (fs.existsSync(skillDir)) {
      fs.removeSync(skillDir);
    }

    await extractZip(tempZip, universalFullPath);
    fs.removeSync(tempZip);

    console.log(chalk.green(`✅ Copied to: ${skillDir}`));

    for (const dir of dirs) {
      const fullDir = dir.endsWith('/skills') ? dir : `${dir}/skills`;
      const dirPath = path.join(basePath, fullDir);
      fs.ensureDirSync(dirPath);
      const destDir = path.join(dirPath, skillName);

      if (fs.existsSync(destDir)) {
        fs.removeSync(destDir);
      }

      fs.copySync(skillDir, destDir);
      console.log(chalk.green(`✅ Copied to: ${destDir}`));
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
  
  for (const dir of dirs) {
    const fullDir = dir.endsWith('/skills') ? dir : `${dir}/skills`;
    const dirPath = path.join(basePath, fullDir);
    const destDir = path.join(dirPath, skillName);
    
    if (method === 'symlink') {
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
