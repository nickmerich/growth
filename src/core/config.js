import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { CONFIG_DIR, CONFIG_FILE } from '../utils/paths.js';
import { fetchJSON } from '../utils/fetch.js';

const DEFAULT_CONFIG = {
  marketplaces: [],
  plugins: [],
};

export async function load() {
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function save(config) {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}

export async function addMarketplace(ownerRepo) {
  const [owner, repo] = ownerRepo.split('/');
  if (!owner || !repo) {
    throw new Error('Marketplace must be in owner/repo format');
  }

  const config = await load();
  const exists = config.marketplaces.some(
    (m) => m.owner === owner && m.repo === repo
  );
  if (exists) {
    console.log(`Marketplace already registered: ${ownerRepo}`);
    return config;
  }

  config.marketplaces.push({
    owner,
    repo,
    addedAt: new Date().toISOString(),
  });
  await save(config);

  // Try to fetch remote index; if unavailable, create a local marketplace index
  const localIndexPath = join(CONFIG_DIR, 'marketplaces', `${owner}--${repo}.json`);
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/growth-marketplace.json`;
    await fetchJSON(url);
    // Remote is available, no need for local index
  } catch {
    // Create a default local marketplace index
    const defaultIndex = {
      name: `${owner}/${repo}`,
      plugins: [
        {
          name: 'marketing-skills',
          version: '1.0.0',
          description: 'Core marketing skill frameworks and growth strategies',
          entry: 'plugins/marketing-skills/index.js',
          keywords: ['marketing', 'skills', 'growth'],
        },
        {
          name: 'funnel-strategies',
          version: '1.0.0',
          description: 'Growth funnel strategy templates and optimization tools',
          entry: 'plugins/funnel-strategies/index.js',
          keywords: ['funnel', 'strategy', 'conversion'],
        },
        {
          name: 'audience-targeting',
          version: '1.0.0',
          description: 'Audience segmentation and targeting frameworks',
          entry: 'plugins/audience-targeting/index.js',
          keywords: ['audience', 'targeting', 'segmentation'],
        },
        {
          name: 'content-marketing',
          version: '1.0.0',
          description: 'Content marketing planning and distribution strategies',
          entry: 'plugins/content-marketing/index.js',
          keywords: ['content', 'marketing', 'distribution'],
        },
        {
          name: 'analytics-insights',
          version: '1.0.0',
          description: 'Marketing analytics and performance tracking tools',
          entry: 'plugins/analytics-insights/index.js',
          keywords: ['analytics', 'metrics', 'insights'],
        },
      ],
    };
    await mkdir(dirname(localIndexPath), { recursive: true });
    await writeFile(localIndexPath, JSON.stringify(defaultIndex, null, 2) + '\n');
    console.log('  Created local marketplace index (remote not available)');
  }

  return config;
}

export async function removeMarketplace(ownerRepo) {
  const [owner, repo] = ownerRepo.split('/');
  const config = await load();
  const before = config.marketplaces.length;
  config.marketplaces = config.marketplaces.filter(
    (m) => !(m.owner === owner && m.repo === repo)
  );
  if (config.marketplaces.length === before) {
    throw new Error(`Marketplace not found: ${ownerRepo}`);
  }
  await save(config);
  return config;
}
