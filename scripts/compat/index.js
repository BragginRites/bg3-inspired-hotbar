// Compatibility registry

import { registerTokenLootCompat } from './token-loot.js';

/**
 * Register external module compat integrations.
 */
export async function registerCompat() {
    try {
        if (game.modules.get('token-loot')?.active) registerTokenLootCompat();
    } catch (e) {
        console.warn('BG3 Hotbar | Compat registration failed:', e);
    }
}


