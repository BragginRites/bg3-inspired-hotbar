/**
 * Show a deprecation warning using DialogV2
 */
export async function showDeprecationWarning() {
    const { DialogV2 } = foundry.applications.api;

    const content = `
    <div class="bg3-deprecation-notice">
        <p><strong>BG3 Inspired Hotbar has been superseded!</strong></p>
        <p>
            This module (bg3-inspired-hotbar) is now deprecated and will no longer receive updates. 
            It has been replaced by a modular system designed for better performance and maintainability:
        </p>
        <ul style="margin-bottom: 1rem;">
            <li><strong><a href="https://github.com/BragginRites/bg3-hud-core" target="_blank">BG3 Inspired HUD - Core</a></strong> (Required)</li>
            <li><strong><a href="https://github.com/BragginRites/bg3-hud-dnd5e" target="_blank">BG3 Inspired HUD - D&D5e</a></strong></li>
            <li><strong><a href="https://github.com/BragginRites/bg3-hud-pf2e" target="_blank">BG3 Inspired HUD - PF2e</a></strong></li>
        </ul>
        <p>
            Please install the Core module and the appropriate adapter for your game system.
        </p>
        <p class="notes" style="font-size: 0.9em; color: var(--color-text-light-5);">
            <em>Note: Due to the complete rewrite, some features may differ or be missing initially. 
            Please report issues on the repository for the specific adapter module.</em>
        </p>
    </div>
    `;

    return new DialogV2({
        window: {
            title: "Module Deprecated",
            icon: "fas fa-exclamation-triangle",
        },
        content: content,
        buttons: [
            {
                action: "ok",
                label: "I Understand",
                default: true,
                callback: (event, button, dialog) => dialog.close()
            },
            {
                action: "dismiss",
                label: "Don't Show Again",
                callback: async (event, button, dialog) => {
                    await game.settings.set("bg3-inspired-hotbar", "suppressDeprecationWarning", true);
                    return dialog.close();
                }
            }
        ],
        position: {
            width: 500
        },
        modal: true
    }).render(true);
}
