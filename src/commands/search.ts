import chalk from 'chalk';
import { searchSkills } from '../api';
import ora from 'ora';

function getLanguageName(code: string | null | undefined): string {
  if (!code) return 'N/A';
  return code === 'en' ? 'English' : code === 'zh' ? '中文' : code;
}

export async function search(query: string, limit: number = 10, json: boolean = false): Promise<void> {
  const spinner = ora(`Searching for "${query}"...`).start();

  try {
    const result = await searchSkills(query, limit);
    spinner.stop();

    if (result.skills.length === 0) {
      console.log(chalk.yellow(`\nNo skills found matching "${query}".\n`));
      return;
    }

    if (json) {
      const jsonResult = {
        totalResults: result.totalResults,
        returnedCount: result.returnedCount,
        query: result.query,
        readCommand: "npx skill4agent read <source> <skill_name>  # add '--type translated' if read translated version",
        installCommand: "npx skill4agent install <source> <skill_name>  # add '--type translated' if install translated version",
        skills: result.skills.map((skill: any) => {
          const { download_zip_url, ...rest } = skill;
          return rest;
        }),
      };
      console.log(JSON.stringify(jsonResult, null, 2));
      return;
    }

    console.log(chalk.blue(`\n🔍 Search Results for "${query}" (${result.returnedCount} of ${result.totalResults} results)\n`));

    console.log(chalk.blue('To read a skill, run:'));
    console.log(chalk.gray('  npx skill4agent read <source> <skill_name>'));
    console.log(chalk.gray('  # add "--type translated" if read translated version\n'));

    console.log(chalk.blue('To install a skill, run:'));
    console.log(chalk.gray('  npx skill4agent install <source> <skill_name>'));
    console.log(chalk.gray('  # add "--type translated" if install translated version\n'));

    for (const skill of result.skills) {
      console.log(`${chalk.green('skillId:')} ${skill.skillId}`);
      console.log(`${chalk.green('source:')} ${skill.source}`);
      console.log(`${chalk.green('skill_name:')} ${skill.skillName}`);
      console.log(`${chalk.green('category:')} ${skill.categoryName || 'N/A'}`);
      console.log(`${chalk.green('description:')} ${skill.description || 'N/A'}`);
      console.log(`${chalk.green('tags:')} ${skill.tags || 'N/A'}`);
      console.log(`${chalk.green('installs:')} ${skill.totalInstalls.toString()}`);
      
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
      
      console.log(chalk.cyan('═══════════════════════════════════════════════════════════════════════════════════════════════'));
    }
  } catch (error: any) {
    spinner.stop();
    console.log(chalk.red(`\n❌ Search failed: ${error.message}\n`));
  }
}
