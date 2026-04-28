import { homedir } from 'node:os';
import { join } from 'node:path';

const GROWTH_HOME = process.env.GROWTH_HOME || join(homedir(), '.growth');

export const CONFIG_DIR = GROWTH_HOME;
export const CONFIG_FILE = join(GROWTH_HOME, 'config.json');
export const PLUGINS_DIR = join(GROWTH_HOME, 'plugins');
