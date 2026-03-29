import { addMarketplace, removeMarketplace, load } from '../core/config.js';
import { fetchIndex } from '../core/registry.js';

export async function handleMarketplace(subcommand, args) {
  switch (subcommand) {
    case 'add': {
      const ownerRepo = args[0];
      if (!ownerRepo) {
        console.error('Usage: growth marketplace add <owner/repo>');
        process.exit(1);
      }
      await addMarketplace(ownerRepo);
      console.log(`Added marketplace: ${ownerRepo}`);
      break;
    }

    case 'remove': {
      const ownerRepo = args[0];
      if (!ownerRepo) {
        console.error('Usage: growth marketplace remove <owner/repo>');
        process.exit(1);
      }
      await removeMarketplace(ownerRepo);
      console.log(`Removed marketplace: ${ownerRepo}`);
      break;
    }

    case 'list': {
      const config = await load();
      if (config.marketplaces.length === 0) {
        console.log('No marketplaces registered.');
        console.log('Run `growth marketplace add <owner/repo>` to add one.');
        return;
      }

      for (const mp of config.marketplaces) {
        const label = `${mp.owner}/${mp.repo}`;
        console.log(`\n${label}`);
        try {
          const index = await fetchIndex(mp.owner, mp.repo);
          if (index.plugins?.length > 0) {
            for (const p of index.plugins) {
              console.log(`  - ${p.name} (v${p.version}): ${p.description}`);
            }
          } else {
            console.log('  (no plugins)');
          }
        } catch {
          console.log('  (could not fetch marketplace index)');
        }
      }
      break;
    }

    default:
      console.error(
        'Usage: growth marketplace <add|remove|list> [args]'
      );
      process.exit(1);
  }
}
