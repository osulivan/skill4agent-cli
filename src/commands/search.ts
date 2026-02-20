import chalk from 'chalk';
import { searchSkills } from '../api';
import ora from 'ora';

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
        skills: result.skills.map((skill: any) => {
          const { download_zip_url, ...rest } = skill;
          return rest;
        }),
        totalResults: result.totalResults,
        returnedCount: result.returnedCount,
        query: result.query,
      };
      console.log(JSON.stringify(jsonResult, null, 2));
      return;
    }

    console.log(chalk.blue(`\n🔍 Search Results for "${query}" (${result.returnedCount} of ${result.totalResults} results)\n`));

    for (const skill of result.skills) {
      console.log(`${chalk.green('source:')} ${chalk.bold(skill.source)}`);
      console.log(`${chalk.green('skill_name:')} ${chalk.bold(skill.skillName)}`);
      console.log(`${chalk.green('category:')} ${chalk.bold(skill.categoryName || 'N/A')}`);
      console.log(`${chalk.green('description:')} ${chalk.bold(skill.description || 'N/A')}`);
      console.log(`${chalk.green('tags:')} ${chalk.bold(skill.tags || 'N/A')}`);
      console.log(`${chalk.green('installs:')} ${chalk.bold(skill.totalInstalls.toString())}`);
      console.log(`${chalk.green('has_script:')} ${chalk.bold(skill.has_script.toString())}`);
      if (skill.has_script && skill.script_check_result) {
        console.log(`${chalk.green('script_check_result:')} ${chalk.bold(skill.script_check_result)}`);
        if (skill.script_check_notes) {
          console.log(`${chalk.green('script_check_notes:')} ${chalk.bold(skill.script_check_notes)}`);
        }
      }
      
      console.log(chalk.cyan('═══════════════════════════════════════════════════════════════════════════════════════════════'));
    }

    console.log(chalk.blue('To install a skill, run:'));
    console.log(chalk.gray('  npx skill4agent install <source> <skill_name> [options]\n'));
  } catch (error: any) {
    spinner.stop();
    console.log(chalk.red(`\n❌ Search failed: ${error.message}\n`));
  }
}
