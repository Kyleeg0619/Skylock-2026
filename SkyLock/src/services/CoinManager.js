import { AngelRegistry } from '../data/AngelRegistry.js';
import { IslandRegistry } from '../data/IslandRegistry.js';
import { updateCoinCount } from './ui.js';

export default class CoinManager {
    constructor(player) {
        this.player = player;
        this.coinsPerMinute = 0;
        this.accumulatedCoins = 0;
        this.interval = null;
        this.syncInterval = null;
        this.SYNC_INTERVAL = 10000; // Sync with Firebase every 10 seconds
    }

    // Calculate total coins per minute based on placed angels and islands
    calculateCoinsPerMinute() {
        const islandLayout = Array.isArray(window.gameCustomization?.islandLayout)
            ? window.gameCustomization.islandLayout
            : [];
        const angelLayout = Array.isArray(window.gameCustomization?.angelLayout)
            ? window.gameCustomization.angelLayout
            : [];

        let total = 1; // Base coin income per minute

        islandLayout.forEach((islandKey, slotIndex) => {
            if (!islandKey) return;

            const islandData = IslandRegistry[islandKey];
            if (!islandData) return;

            const islandMultiplier = typeof islandData.buff?.coins === 'number'
                ? islandData.buff.coins
                : 1;
            const angels = angelLayout[slotIndex] || [null, null];

            angels.forEach(angelKey => {
                if (!angelKey) return;

                const angelData = AngelRegistry[angelKey];
                if (!angelData) return;

                const angelCoins = typeof angelData.buff?.coins === 'number'
                    ? angelData.buff.coins
                    : 0;

                // Angel coins * island multiplier
                total += angelCoins * islandMultiplier;
            });
        });

        this.coinsPerMinute = total;
        return total;
    }

    // Start the coin generation timer
    start() {
        if (this.interval) this.stop();

        this.calculateCoinsPerMinute();

        // Update every second
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);

        // Sync with Firebase every 10 seconds
        this.syncInterval = setInterval(() => {
            this.syncCoins();
        }, this.SYNC_INTERVAL);
    }

    // Stop the timer
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

   // Called every second
tick() {
    if (this.coinsPerMinute <= 0) return;

    // Coins per second = coinsPerMinute / 60
    const coinsThisTick = this.coinsPerMinute / 60;

    // Accumulate coins locally
    this.accumulatedCoins += coinsThisTick;

    // Update coin display through the shared UI helper (using current player.coins + accumulated)
    updateCoinCount(this.player.coins + this.accumulatedCoins);
}

    // Sync accumulated coins with Firebase every 10 seconds
    async syncCoins() {
        try {
            // Load current coins from Firebase
            await this.player.loadCoins();
            // Add accumulated coins
            this.player.coins += this.accumulatedCoins;
            // Save back to Firebase
            await this.player.save();
            // Reset accumulator
            this.accumulatedCoins = 0;
            // Update display (though it should already be updated)
            updateCoinCount(this.player.coins);
        } catch (error) {
            console.error('Error syncing coins with Firebase:', error);
        }
    }

    // Update CPM when layout changes
    onLayoutChange() {
        this.calculateCoinsPerMinute();
    }

    // Get formatted CPM display string
    getCoinsPerMinuteDisplay() {
        const cpm = this.calculateCoinsPerMinute();
        return cpm.toFixed(1);
    }
}