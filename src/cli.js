import { handleMarketplace } from './commands/marketplace.js';
import { handlePlugin } from './commands/plugin.js';
import { handleRun } from './commands/run.js';

const HELP = `
growth - Growth toolkit with marketplace plugins

Usage:
  growth run <plugin> [skill]            Run a plugin or a specific skill
  growth run <plugin>                    List available skills in a plugin

  growth marketplace add <owner/repo>    Register a plugin marketplace
  growth marketplace remove <owner/repo> Remove a marketplace
  growth marketplace list                List marketplaces and available plugins

  growth plugin install <name>           Install a plugin (or all from a marketplace)
  growth plugin uninstall <name>         Remove an installed plugin
  growth plugin list                     List installed plugins

  growth --help                          Show this help message
`.trim();

export async function run(argv) {
  const command = argv[0];
  const subcommand = argv[1];
  const args = argv.slice(2);

  if (!command || command === '--help' || command === '-h') {
    console.log(HELP);
    return;
  }

  try {
    switch (command) {
      case 'marketplace':
        await handleMarketplace(subcommand, args);
        break;
      case 'plugin':
        await handlePlugin(subcommand, args);
        break;
      case 'run':
        await handleRun(subcommand, args);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log(HELP);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
