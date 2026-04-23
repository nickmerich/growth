import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { PLUGINS_DIR } from '../utils/paths.js';
import { load } from '../core/config.js';

export async function handleRun(pluginName, args) {
  if (!pluginName) {
    const config = await load();
    if (config.plugins.length === 0) {
      console.log('No plugins installed. Run `growth plugin install <name>` first.');
      return;
    }
    console.log('\nInstalled plugins:\n');
    for (const p of config.plugins) {
      console.log(`  ${p.name.padEnd(22)} v${p.version}`);
    }
    console.log('\nRun: growth run <plugin-name> [skill-name]');
    return;
  }

  const pluginDir = join(PLUGINS_DIR, pluginName);
  const metaPath = join(pluginDir, 'plugin.json');

  try {
    await readFile(metaPath, 'utf-8');
  } catch {
    console.error(`Plugin "${pluginName}" is not installed.`);
    console.log('Run `growth plugin list` to see installed plugins.');
    process.exit(1);
  }

  const entryPath = join(pluginDir, 'index.js');
  try {
    const mod = await import(pathToFileURL(entryPath).href);

    if (typeof mod.run !== 'function') {
      console.error(`Plugin "${pluginName}" does not export a run() function.`);
      process.exit(1);
    }

    await mod.run(args);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      console.error(`Plugin "${pluginName}" has no entry file. Try reinstalling.`);
      process.exit(1);
    }
    throw err;
  }
}
