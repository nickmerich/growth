import { load } from './config.js';
import { fetchIndex } from './registry.js';

export async function resolve(pluginName) {
  const config = await load();

  if (config.marketplaces.length === 0) {
    throw new Error(
      'No marketplaces registered. Run `growth marketplace add <owner/repo>` first.'
    );
  }

  const errors = [];

  for (const mp of config.marketplaces) {
    try {
      const index = await fetchIndex(mp.owner, mp.repo);
      const plugin = index.plugins?.find((p) => p.name === pluginName);
      if (plugin) {
        return {
          ...plugin,
          marketplace: `${mp.owner}/${mp.repo}`,
          marketplaceOwner: mp.owner,
          marketplaceRepo: mp.repo,
        };
      }
    } catch (err) {
      errors.push(`  ${mp.owner}/${mp.repo}: ${err.message}`);
    }
  }

  const searched = config.marketplaces
    .map((m) => `${m.owner}/${m.repo}`)
    .join(', ');
  let msg = `Plugin "${pluginName}" not found. Searched: ${searched}`;
  if (errors.length > 0) {
    msg += `\nErrors:\n${errors.join('\n')}`;
  }
  throw new Error(msg);
}

export async function resolveAll(marketplaceOwnerRepo) {
  const [owner, repo] = marketplaceOwnerRepo.split('/');
  const index = await fetchIndex(owner, repo);
  if (!index.plugins || index.plugins.length === 0) {
    throw new Error(`No plugins found in ${marketplaceOwnerRepo}`);
  }
  return index.plugins.map((plugin) => ({
    ...plugin,
    marketplace: marketplaceOwnerRepo,
    marketplaceOwner: owner,
    marketplaceRepo: repo,
  }));
}
