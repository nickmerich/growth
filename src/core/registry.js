import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CONFIG_DIR } from '../utils/paths.js';
import { fetchJSON } from '../utils/fetch.js';

function localIndexPath(owner, repo) {
  return join(CONFIG_DIR, 'marketplaces', `${owner}--${repo}.json`);
}

async function loadLocalIndex(owner, repo) {
  try {
    const data = await readFile(localIndexPath(owner, repo), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function fetchIndex(owner, repo) {
  // Try remote first
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/growth-marketplace.json`;
  try {
    return await fetchJSON(url);
  } catch {
    // Fall back to local index
  }

  const local = await loadLocalIndex(owner, repo);
  if (local) {
    return local;
  }

  throw new Error(
    `Could not fetch marketplace index from ${owner}/${repo} (remote unavailable and no local index found)`
  );
}

export { localIndexPath };
