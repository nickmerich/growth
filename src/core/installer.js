import { mkdir, writeFile, rm, copyFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLUGINS_DIR } from '../utils/paths.js';
import { fetchText } from '../utils/fetch.js';
import { load, save } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_PLUGINS_DIR = join(__dirname, '..', '..', 'plugins');

export async function install(resolvedPlugin) {
  const config = await load();
  const existing = config.plugins.find((p) => p.name === resolvedPlugin.name);

  if (existing && existing.version === resolvedPlugin.version) {
    console.log(
      `  ${resolvedPlugin.name}@${resolvedPlugin.version} already installed. Skipping.`
    );
    return;
  }

  const pluginDir = join(PLUGINS_DIR, resolvedPlugin.name);
  await mkdir(pluginDir, { recursive: true });

  // Download entry file from marketplace repo, fall back to bundled plugins
  let entryInstalled = false;
  if (resolvedPlugin.entry) {
    const url = `https://raw.githubusercontent.com/${resolvedPlugin.marketplaceOwner}/${resolvedPlugin.marketplaceRepo}/main/${resolvedPlugin.entry}`;
    try {
      const content = await fetchText(url);
      const entryFilename = resolvedPlugin.entry.split('/').pop();
      await writeFile(join(pluginDir, entryFilename), content);
      entryInstalled = true;
    } catch {
      // Remote not available — try bundled plugin
    }
  }

  if (!entryInstalled) {
    const bundledEntry = join(BUNDLED_PLUGINS_DIR, resolvedPlugin.name, 'index.js');
    try {
      await copyFile(bundledEntry, join(pluginDir, 'index.js'));
    } catch {
      // No bundled plugin available
    }
  }

  // Write plugin metadata
  await writeFile(
    join(pluginDir, 'plugin.json'),
    JSON.stringify(
      {
        name: resolvedPlugin.name,
        version: resolvedPlugin.version,
        description: resolvedPlugin.description,
        marketplace: resolvedPlugin.marketplace,
      },
      null,
      2
    ) + '\n'
  );

  // Update config
  if (existing) {
    existing.version = resolvedPlugin.version;
    existing.installedAt = new Date().toISOString();
  } else {
    config.plugins.push({
      name: resolvedPlugin.name,
      version: resolvedPlugin.version,
      marketplace: resolvedPlugin.marketplace,
      installedAt: new Date().toISOString(),
    });
  }
  await save(config);

  console.log(
    `  Installed ${resolvedPlugin.name}@${resolvedPlugin.version} from ${resolvedPlugin.marketplace}`
  );
}

export async function uninstall(pluginName) {
  const config = await load();
  const idx = config.plugins.findIndex((p) => p.name === pluginName);
  if (idx === -1) {
    throw new Error(`Plugin "${pluginName}" is not installed`);
  }

  const pluginDir = join(PLUGINS_DIR, pluginName);
  await rm(pluginDir, { recursive: true, force: true });

  config.plugins.splice(idx, 1);
  await save(config);
}
