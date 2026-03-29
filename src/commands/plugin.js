import { load } from '../core/config.js';
import { resolve, resolveAll } from '../core/resolver.js';
import { install, uninstall } from '../core/installer.js';

export async function handlePlugin(subcommand, args) {
  switch (subcommand) {
    case 'install': {
      const pluginName = args[0];
      if (!pluginName) {
        console.error('Usage: growth plugin install <plugin-name>');
        process.exit(1);
      }

      const config = await load();
      if (config.marketplaces.length === 0) {
        console.error(
          'No marketplaces registered. Run `growth marketplace add <owner/repo>` first.'
        );
        process.exit(1);
      }

      console.log('Searching marketplaces...');

      // Check if the plugin name matches a marketplace — install all its plugins
      const normalize = (s) => s.toLowerCase().replace(/[-_\s.]/g, '');
      const normalizedName = normalize(pluginName);
      const matchingMp = config.marketplaces.find((m) => {
        const fullName = `${m.owner}/${m.repo}`;
        return (
          normalizedName === normalize(fullName) ||
          normalizedName === normalize(m.repo)
        );
      });

      if (matchingMp) {
        // Install all plugins from this marketplace
        const mpLabel = `${matchingMp.owner}/${matchingMp.repo}`;
        console.log(`Installing all plugins from ${mpLabel}...`);
        try {
          const plugins = await resolveAll(mpLabel);
          for (const plugin of plugins) {
            await install(plugin);
          }
          console.log(
            `\nInstalled ${plugins.length} plugin(s) from ${mpLabel}`
          );
        } catch (err) {
          console.error(err.message);
          process.exit(1);
        }
        return;
      }

      // Otherwise resolve a single plugin by name
      try {
        const resolved = await resolve(pluginName);
        console.log(
          `Found ${resolved.name}@${resolved.version} in ${resolved.marketplace}`
        );
        await install(resolved);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
      break;
    }

    case 'uninstall': {
      const pluginName = args[0];
      if (!pluginName) {
        console.error('Usage: growth plugin uninstall <plugin-name>');
        process.exit(1);
      }
      try {
        await uninstall(pluginName);
        console.log(`Uninstalled: ${pluginName}`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
      break;
    }

    case 'list': {
      const config = await load();
      if (config.plugins.length === 0) {
        console.log('No plugins installed.');
        return;
      }
      for (const p of config.plugins) {
        console.log(`${p.name} (v${p.version}) from ${p.marketplace}`);
      }
      break;
    }

    default:
      console.error(
        'Usage: growth plugin <install|uninstall|list> [args]'
      );
      process.exit(1);
  }
}
