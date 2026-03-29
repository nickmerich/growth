import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { PLUGINS_DIR } from '../utils/paths.js';
import { fetchText } from '../utils/fetch.js';
import { load, save } from './config.js';

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

  // Download entry file from marketplace repo
  if (resolvedPlugin.entry) {
    const url = `https://raw.githubusercontent.com/${resolvedPlugin.marketplaceOwner}/${resolvedPlugin.marketplaceRepo}/main/${resolvedPlugin.entry}`;
    try {
      const content = await fetchText(url);
      const entryFilename = resolvedPlugin.entry.split('/').pop();
      await writeFile(join(pluginDir, entryFilename), content);
    } catch {
      // Entry file may not exist yet in remote — that's okay for marketplace registration
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
