// Token Loot compatibility

import { BG3CONFIG } from '../utils/config.js';
import { AutoPopulateCreateToken } from '../features/AutoPopulateCreateToken.js';

/**
 * Register Token Loot compatibility hooks and helpers.
 */
export function registerTokenLootCompat() {
    // Expose a small compat API for internal use
    const api = game.modules.get('token-loot')?.api;

    // 1) Finalize once per token when Token Loot signals completion
    Hooks.on('token-loot.awarded', async (tokenDocument) => {
        try {
            console.debug('BG3 Hotbar | Token Loot awarded items to token:', tokenDocument.id);
            const token = canvas?.tokens?.get(tokenDocument.id);
            if (!token?.actor) return;
            // Only handle NPCs per our autopopulate rules
            if (token.actor.type === 'character') return;
            console.debug('BG3 Hotbar | Populating hotbar after Token Loot completion for token:', token.id);
            await AutoPopulateCreateToken.populateUnlinkedToken(token);
            // Refresh UI if this token is currently displayed
            if (ui.BG3HOTBAR?.manager?.currentTokenId === token.id) {
                await ui.BG3HOTBAR.generate(token);
            }
        } catch (e) {
            console.warn('BG3 Hotbar | token-loot.awarded finalize failed:', e);
        }
    });

    // 2) Optional explicit wait API hook-up (usable from our core if desired)
    Hooks.on('bg3-hotbar.wait-for-token-loot', async (tokenDocument, resolve) => {
        try {
            if (api?.waitForGrants) {
                await api.waitForGrants(tokenDocument);
            }
        } catch (_) {
            // no-op
        } finally {
            resolve?.();
        }
    });
}


