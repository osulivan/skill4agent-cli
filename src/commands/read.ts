import chalk from 'chalk';
import { getSkillRead } from '../api';
import ora from 'ora';

function getLanguageName(code: string | null | undefined): string {
  if (!code) return 'N/A';
  return code === 'en' ? 'English' : code === 'zh' ? '中文' : code;
}

export async function read(source: string, skillName: string, type: 'original' | 'translated' = 'original', json: boolean = false): Promise<void> {
  const spinner = ora(`Reading skill "${skillName}"...`).start();

  try {
    const skill = await getSkillRead(source, skillName, type);
    spinner.stop();

    if (!skill) {
      console.log(chalk.red(`\n❌ Skill not found: ${skillName}\n`));
      return;
    }

    if (json) {
      const { download_zip_url, content, content_type, ...rest } = skill;
      const jsonResult: any = {
        installCommand: `npx skill4agent install ${skill.source} ${skill.skillName}  # add '--type translated' if install translated version`,
        ...rest,
        content_type,
      };
      if (content) {
        jsonResult.content = content;
      }
      console.log(JSON.stringify(jsonResult, null, 2));
      return;
    }

    console.log(chalk.blue('To install this skill, run:'));
    console.log(chalk.gray(`  npx skill4agent install ${skill.source} ${skill.skillName}  # add '--type translated' if install translated version`));

    console.log(chalk.blue(`📖 Skill: ${skill.skillName}\n`));

    console.log(`${chalk.green('skillId:')} ${skill.skillId}`);
    console.log(`${chalk.green('source:')} ${skill.source}`);
    console.log(`${chalk.green('skill_name:')} ${skill.skillName}`);
    console.log(`${chalk.green('description:')} ${skill.description || 'N/A'}`);
    console.log(`${chalk.green('tags:')} ${skill.tags || 'N/A'}`);
    console.log(`${chalk.green('category:')} ${skill.category?.nameCn || skill.category?.nameEn || 'N/A'}`);
    console.log(`${chalk.green('installs:')} ${skill.totalInstalls}`);

    console.log(chalk.blue('  [Translation]'));
    console.log(`    ${chalk.green('original_language:')} ${getLanguageName(skill.translation?.original_language)}`);
    console.log(`    ${chalk.green('has_translation:')} ${skill.translation?.has_translation ? 'Yes' : 'No'}`);
    if (skill.translation?.has_translation && skill.translation?.translated_language) {
      console.log(`    ${chalk.green('translated_language:')} ${getLanguageName(skill.translation.translated_language)}`);
    }

    console.log(chalk.blue('  [Script]'));
    console.log(`    ${chalk.green('has_script:')} ${skill.script?.has_script?.toString() || 'false'}`);
    if (skill.script?.has_script && skill.script?.script_check_result) {
      console.log(`    ${chalk.green('script_check_result:')} ${skill.script.script_check_result}`);
      if (skill.script?.script_check_notes) {
        console.log(`    ${chalk.green('script_check_notes:')} ${skill.script.script_check_notes}`);
      }
    }

    console.log(chalk.blue('  [Content]'));
    console.log(`    ${chalk.green('type:')} ${skill.content_type || 'N/A'}`);
    console.log(`    ${chalk.green('SKILL.md content:')}`);
    if (skill.content) {
      console.log(chalk.gray('─'.repeat(80)));
      console.log(skill.content);
      console.log(chalk.gray('─'.repeat(80)));
    } else {
      console.log(chalk.gray('    (No content available)'));
    }
  } catch (error: any) {
    spinner.stop();
    console.log(chalk.red(`\n❌ Failed to read skill: ${error.message}\n`));
  }
}
