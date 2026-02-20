import chalk from 'chalk';
import { searchSkills } from '../api';
import ora from 'ora';

export async function search(query: string, limit: number = 10): Promise<void> {
  const spinner = ora(`Searching for "${query}"...`).start();

  try {
    const result = await searchSkills(query, limit);
    spinner.stop();

    if (result.skills.length === 0) {
      console.log(chalk.yellow(`\nNo skills found matching "${query}".\n`));
      return;
    }

    console.log(chalk.blue(`\n🔍 Search Results for "${query}" (${result.returnedCount} of ${result.totalResults} results)\n`));

    for (const skill of result.skills) {
      const source = skill.skillId.split('--')[1] || 'unknown';
      
      console.log(`source: ${source}`);
      console.log(`skill_name: ${skill.skillName}`);
      console.log(`category: ${skill.categoryName || 'N/A'}`);
      console.log(`description: ${skill.description || 'N/A'}`);
      console.log(`tags: ${skill.tags || 'N/A'}`);
      console.log(`installs: ${skill.totalInstalls}`);
      console.log('---');
    }

    console.log(chalk.blue('To install a skill, run:'));
    console.log(chalk.gray('  npx skill4agent install <source> <skill_name> [options]\n'));
  } catch (error: any) {
    spinner.stop();
    console.log(chalk.red(`\n❌ Search failed: ${error.message}\n`));
  }
}
