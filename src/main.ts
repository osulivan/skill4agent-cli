import chalk from 'chalk';
import { Command } from 'commander';
import { install } from './commands/install';
import { add } from './commands/add';
import { list, update } from './commands/list';
import { search } from './commands/search';
import { read } from './commands/read';
import { uninstall } from './commands/uninstall';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
const version = packageJson.version;

const program = new Command();

program
  .name('skill4agent')
  .description('CLI tool for installing and managing agent skills')
  .version(version);

program
  .command('add <top_source> <skill_name>')
  .description('Interactive installation with guided prompts')
  .action(async (topSource: string, skillName: string) => {
    await add(topSource, skillName);
  });

program
  .command('install <top_source> <skill_name>')
  .description('Non-interactive installation with command-line options')
  .option('--type <type>', 'Package type: original or translated', 'original')
  .option('--global', 'Install to global storage')
  .option('--dirs <dirs>', 'Additional directories (comma-separated): .trae,.cursor,.qwen')
  .option('--method <method>', 'Installation method: symlink or copy', 'symlink')
  .action(async (topSource: string, skillName: string, options: any) => {
    if (options.type && !['original', 'translated'].includes(options.type)) {
      console.log(chalk.red('\n❌ Invalid --type value. Must be "original" or "translated".\n'));
      process.exit(1);
    }

    if (options.method && !['symlink', 'copy'].includes(options.method)) {
      console.log(chalk.red('\n❌ Invalid --method value. Must be "symlink" or "copy".\n'));
      process.exit(1);
    }

    const dirsArray = options.dirs
      ? options.dirs.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
      : [];

    await install({
      topSource,
      skillName,
      type: options.type || 'original',
      global: !!options.global,
      dirs: dirsArray,
      method: options.method || 'symlink',
    });
  });

program
  .command('list')
  .description('List installed skills')
  .action(list);

program
  .command('search <query>')
  .description('Search for skills')
  .option('-l, --limit <number>', 'Number of results to return', '10')
  .option('-j, --json', 'Output in JSON format')
  .action(async (query: string, options: any) => {
    const limit = parseInt(options.limit) || 10;
    const json = options.json || false;
    await search(query, limit, json);
  });

program
  .command('read <top_source> <skill_name>')
  .description('Read skill details and SKILL.md content')
  .option('--type <type>', 'Content type: original or translated', 'original')
  .option('-j, --json', 'Output in JSON format')
  .action(async (topSource: string, skillName: string, options: any) => {
    const type = options.type === 'translated' ? 'translated' : 'original';
    const json = options.json || false;
    await read(topSource, skillName, type, json);
  });

program
  .command('update [skill_name]')
  .description('Update installed skills')
  .action(update);

program
  .command('uninstall <skill_name>')
  .description('Uninstall a skill')
  .option('--global', 'Uninstall from global storage only')
  .option('--project', 'Uninstall from all projects (non-global installations)')
  .action(async (skillName: string, options: any) => {
    await uninstall(skillName, {
      global: !!options.global,
      project: !!options.project,
    });
  });

program.parse();

process.on('unhandledRejection', (reason: any) => {
  console.error(chalk.red('Error:'), reason);
  process.exit(1);
});
