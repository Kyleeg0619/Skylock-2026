import { AngelRegistry } from '../data/AngelRegistry.js';
import { IslandRegistry } from '../data/IslandRegistry.js';

export default class CoinManager {
    constructor(player) {
        this.player = player;
        this.coinsPerMinute = 0;
        this.interval = null;
        this.lastSaveTime = Date.now();
        this.SAVE_INTERVAL = 30000; // Save to Firebase every 30 seconds
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
        console.log(`Coins per minute: ${total}`);
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

        console.log('CoinManager started. CPM:', this.coinsPerMinute);
    }

    // Stop the timer
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

   // Called every second
tick() {
    if (this.coinsPerMinute <= 0) return;

    // Coins per second = coinsPerMinute / 60
    const coinsThisTick = this.coinsPerMinute / 60;

    // Add coins
    this.player.coins += coinsThisTick;

    // Update coin display - show whole numbers only
    const coinDisplay = document.getElementById('coinCount');
    if (coinDisplay) {
        coinDisplay.textContent = Math.floor(this.player.coins);
    }

    // Save to Firebase every 30 seconds
    const now = Date.now();
    if (now - this.lastSaveTime >= this.SAVE_INTERVAL) {
        this.saveCoins();
    }
}

   async saveCoins() {
    try {
        // Keep fractional coin accumulation internally and only floor for display.
        await this.player.save();
        this.lastSaveTime = Date.now();
        console.log('Coins saved:', this.player.coins);
    } catch (e) {
        console.error('Error saving coins:', e);
    }
}

    // Update CPM when layout changes
    onLayoutChange() {
        this.calculateCoinsPerMinute();
        console.log('Layout changed, new CPM:', this.coinsPerMinute);
    }

    // Get formatted CPM display string
    getCoinsPerMinuteDisplay() {
        const cpm = this.calculateCoinsPerMinute();
        return cpm.toFixed(1);
    }
}