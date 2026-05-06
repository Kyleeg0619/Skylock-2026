import { AngelRegistry } from '../data/AngelRegistry.js';
import { IslandRegistry } from '../data/IslandRegistry.js';

// --- Default State ---
export const defaultCustomization = {
    selectedAngel1: null,
    selectedAngel2: null,
    selectedIsland: null,
    selectedSlot: null,
    islandLayout: ['starter-island', 'starter-island', 'starter-island', 'starter-island'],
    angelLayout: [['dog-1', null], [null, null], [null, null], [null, null]],
    ownedAngels: ['dog-1'],
    ownedIslands: ['starter-island']
};

// --- Save & Load ---
export function saveCustomization() {
    localStorage.setItem('gameCustomization', JSON.stringify(window.gameCustomization));
    console.log('Customization saved:', window.gameCustomization);
}

export function loadCustomization() {
    const saved = localStorage.getItem('gameCustomization');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            window.gameCustomization = { ...window.gameCustomization, ...parsed };
            console.log('Loaded customization:', window.gameCustomization);
        } catch (e) {
            console.error('Error parsing customization:', e);
        }
    }

    const savedIslandLayout = localStorage.getItem('islandLayout');
    if (savedIslandLayout) {
        try {
            window.gameCustomization.islandLayout = JSON.parse(savedIslandLayout);
            console.log('Loaded island layout:', window.gameCustomization.islandLayout);
        } catch (e) {
            console.error('Error parsing island layout:', e);
        }
    }

    const savedAngelLayout = localStorage.getItem('angelLayout');
    if (savedAngelLayout) {
        try {
            window.gameCustomization.angelLayout = JSON.parse(savedAngelLayout);
            console.log('Loaded angel layout:', window.gameCustomization.angelLayout);
        } catch (e) {
            console.error('Error parsing angel layout:', e);
        }
    }
}

// --- Update from Firebase ---
export function updateOwnedItems(playerData) {
    if (playerData) {
        window.gameCustomization.ownedAngels = playerData.angels?.owned || ['dog-1'];
        window.gameCustomization.ownedIslands = playerData.islands?.owned || ['starter-island'];
        console.log('Updated owned items:', window.gameCustomization.ownedAngels, window.gameCustomization.ownedIslands);
    }
}

// --- Unlock Item ---
export function unlockItem(type, itemId) {
    if (type === 'angel') {
        if (!window.gameCustomization.ownedAngels.includes(itemId)) {
            window.gameCustomization.ownedAngels.push(itemId);
            console.log('Unlocked angel:', itemId);
        }
    } else if (type === 'island') {
        if (!window.gameCustomization.ownedIslands.includes(itemId)) {
            window.gameCustomization.ownedIslands.push(itemId);
            console.log('Unlocked island:', itemId);
        }
    }
}