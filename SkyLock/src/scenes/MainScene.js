import Phaser from "phaser";
import { showUI, initUI } from "../services/ui";
import { Player } from '../gameObjects/Player.js';
import PlayerDataManager from "../services/PlayerDataManager";
import { IslandRegistry } from '../data/IslandRegistry.js';
import { AngelRegistry } from '../data/AngelRegistry.js';
import CoinManager from '../services/CoinManager.js';
import { updateCoinCount } from "../services/ui";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.islands = [];
        this.angels = [];
        this.selectedIslandIndex = null;
        this.assetsLoaded = false;
        this.coinManager = null;

        // Size constants
        this.ISLAND_SCALE = 0.3;
        this.ISLAND_PULSE_SCALE = 0.35;
        this.ANGEL_SCALE = 0.15;
        this.ANGEL_Y_OFFSET = -50;
        this.ANGEL_X_OFFSET = 30;

        // Scroll constants
        this.TOTAL_ISLANDS = 8;
        this.WORLD_HEIGHT = 1400;  // Total scrollable height
        this.GAME_WIDTH = 600;
        this.GAME_HEIGHT = 800;
        this.isScrolling = false;
        this.scrollStartY = 0;
        this.cameraStartY = 0;
    }

    init() {
        this.player = this.registry.get("player");
    }

    preload() {
        if (this.textures.exists('starter-island')) {
            this.assetsLoaded = true;
            return;
        }

        // MainScene: Loading missing textures...
        
        this.load.setPath('assets');
        
        Object.entries(IslandRegistry).forEach(([key, island]) => {
            if (!this.textures.exists(key)) {
                this.load.image(key, `islands/${island.sprite}`);
            }
        });

        Object.entries(AngelRegistry).forEach(([key, angel]) => {
            if (!this.textures.exists(key)) {
                this.load.image(key, `angels/${angel.sprite}`);
            }
        });

        if (!this.textures.exists('bg')) {
            this.load.image('bg', 'backgrounds/island_bg.png');
        }
    }

    create() {
        showUI({
            settings: true,
            home: true,
            shop: true,
            edit: true,
            info: false,
            coins: true,
            excursion: true,
        });

        // music
        this.music = this.sound.add('theme',{
            volume: this.player.settings.music/100
        });
        this.music.setLoop(true);
        this.music.play();

        // Set world bounds for scrolling
        this.cameras.main.setBounds(0, 0, this.GAME_WIDTH, this.WORLD_HEIGHT);
        this.physics.world.setBounds(0, 0, this.GAME_WIDTH, this.WORLD_HEIGHT);
        this.cameras.main.setBackgroundColor('#87ceeb');

        // Background - make it tall enough for scrolling
        if (this.textures.exists('bg')) {
            // First background
            this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.GAME_WIDTH, this.GAME_HEIGHT);
            // Second background (below first)
            this.add.image(0, this.GAME_HEIGHT - 100, 'bg').setOrigin(0, 0).setDisplaySize(this.GAME_WIDTH, this.GAME_HEIGHT);
        }

        // Get player data
        const ownedIslands = this.player?.islands?.owned || ['starter-island'];
        const ownedAngels = this.player?.angels?.owned || ['dog-1'];

        const defaultIsland = ownedIslands[0] || 'starter-island';
        const defaultAngel = ownedAngels[0] || 'dog-1';

        // Load layouts - now 8 islands
        let savedIslandLayout;
        try {
            savedIslandLayout = JSON.parse(localStorage.getItem('islandLayout'));
            // Upgrade from 4 to 8 if needed
            if (savedIslandLayout && savedIslandLayout.length < 8) {
                while (savedIslandLayout.length < 8) {
                    savedIslandLayout.push(defaultIsland);
                }
                localStorage.setItem('islandLayout', JSON.stringify(savedIslandLayout));
            }
            if (!savedIslandLayout) {
                savedIslandLayout = Array(8).fill(defaultIsland);
            }
        } catch (e) {
            savedIslandLayout = Array(8).fill(defaultIsland);
        }

        let savedAngelLayout;
        try {
            savedAngelLayout = JSON.parse(localStorage.getItem('angelLayout'));
            if (savedAngelLayout && !Array.isArray(savedAngelLayout[0])) {
                savedAngelLayout = savedAngelLayout.map(angel => [angel, null]);
            }
            // Upgrade from 4 to 8 if needed
            if (savedAngelLayout && savedAngelLayout.length < 8) {
                while (savedAngelLayout.length < 8) {
                    savedAngelLayout.push([null, null]);
                }
                localStorage.setItem('angelLayout', JSON.stringify(savedAngelLayout));
            }
            if (!savedAngelLayout) {
                savedAngelLayout = [[defaultAngel, null], [null, null], [null, null], [null, null],
                                    [null, null], [null, null], [null, null], [null, null]];
            }
        } catch (e) {
            savedAngelLayout = [[defaultAngel, null], [null, null], [null, null], [null, null],
                                [null, null], [null, null], [null, null], [null, null]];
        }

        // 8 island positions - 2 rows of 2, repeated twice
        const positions = [
            // Page 1 (visible without scrolling)
            { x: 120, y: 190 },   // Slot 0 - Top-left
            { x: 470, y: 190 },   // Slot 1 - Top-right
            { x: 120, y: 540 },   // Slot 2 - Bottom-left
            { x: 470, y: 540 },   // Slot 3 - Bottom-right
            // Page 2 (scroll down to see)
            { x: 120, y: 890 },   // Slot 4 - Top-left (page 2)
            { x: 470, y: 890 },   // Slot 5 - Top-right (page 2)
            { x: 120, y: 1240 },  // Slot 6 - Bottom-left (page 2)
            { x: 470, y: 1240 }   // Slot 7 - Bottom-right (page 2)
        ];

        // Setup platforms
        this.platforms = this.physics.add.staticGroup();
        this.islands = [];
        this.angels = [];

        // Create all 8 islands
        positions.forEach((pos, index) => {
            const islandKey = savedIslandLayout[index];
            const angelKeys = savedAngelLayout[index] || [null, null];

            let islandTexture = islandKey;
            if (!this.textures.exists(islandKey)) {
                console.warn(`Island texture ${islandKey} not found`);
                islandTexture = this.textures.exists('starter-island') ? 'starter-island' : null;

                if (!islandTexture) {
                    const graphics = this.add.graphics();
                    graphics.fillStyle(0x228B22, 1);
                    graphics.fillRect(0, 0, 150, 100);
                    graphics.generateTexture('placeholder-island', 150, 100);
                    graphics.destroy();
                    islandTexture = 'placeholder-island';
                }
            }

            // Create island
            const island = this.platforms.create(pos.x, pos.y, islandTexture);
            island.setScale(this.ISLAND_SCALE).refreshBody();
            island.slotIndex = index;
            island.currentIslandId = islandKey;
            this.islands.push(island);

            // Create click zone
            const clickZone = this.add.zone(pos.x, pos.y, 150, 150);
            clickZone.setInteractive();
            clickZone.setDepth(20);
            island.clickZone = clickZone;

            clickZone.on('pointerdown', () => {
                // Don't select while scrolling
                if (this.isScrolling) return;

                const clickDelay = this.time.now - (clickZone.lastClickTime || 0);
                if (clickDelay < 300) {
                    this.selectIslandForEditing(index);
                }
                clickZone.lastClickTime = this.time.now;
            });

            // Create angels
            const islandAngels = [];

            // Angel 1 (left)
            const angel1Key = angelKeys[0];
            let angel1 = null;
            if (angel1Key && angel1Key !== 'null' && angel1Key !== null) {
                if (this.textures.exists(angel1Key)) {
                    angel1 = this.add.image(
                        pos.x - this.ANGEL_X_OFFSET,
                        pos.y + this.ANGEL_Y_OFFSET,
                        angel1Key
                    );
                    angel1.setScale(this.ANGEL_SCALE);
                    angel1.setDepth(10);
                    angel1.currentAngelId = angel1Key;
                    this.addAngelFloatAnimation(angel1, island);
                }
            }
            islandAngels.push(angel1);

            // Angel 2 (right)
            const angel2Key = angelKeys[1];
            let angel2 = null;
            if (angel2Key && angel2Key !== 'null' && angel2Key !== null) {
                if (this.textures.exists(angel2Key)) {
                    angel2 = this.add.image(
                        pos.x + this.ANGEL_X_OFFSET,
                        pos.y + this.ANGEL_Y_OFFSET,
                        angel2Key
                    );
                    angel2.setScale(this.ANGEL_SCALE);
                    angel2.setDepth(10);
                    angel2.currentAngelId = angel2Key;
                    this.addAngelFloatAnimation(angel2, island);
                }
            }
            islandAngels.push(angel2);

            this.angels.push(islandAngels);
        });

        // Add scroll indicator
        this.createScrollIndicator();

        // Setup scrolling
        this.setupScrolling();

        // Initialize Player
        this.playerObj = new Player(this, 100, 450);
        this.cursors = this.input.keyboard.createCursorKeys();

        // Listen for customization changes
        this.game.events.off('customizationChanged', this.handleCustomizationChange, this);
        this.game.events.on('customizationChanged', this.handleCustomizationChange, this);

        // Update global customization
        window.gameCustomization = window.gameCustomization || {};
        window.gameCustomization.selectedSlot = null;
        window.gameCustomization.islandLayout = savedIslandLayout;
        window.gameCustomization.angelLayout = savedAngelLayout;
        window.gameCustomization.ownedIslands = ownedIslands;
        window.gameCustomization.ownedAngels = ownedAngels;

        // Start coin manager
        this.coinManager = new CoinManager(this.player);
        this.coinManager.start();
        this.updateCPMDisplay();

        // MainScene ready with 8 islands!
    }

    // --- Scrolling ---
    setupScrolling() {
        const cam = this.cameras.main;

        // Mouse wheel scrolling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const newY = cam.scrollY + deltaY * 0.5;
            cam.scrollY = Phaser.Math.Clamp(newY, 0, this.WORLD_HEIGHT - this.GAME_HEIGHT);
            this.updateScrollIndicator();
        });

        // Touch/drag scrolling
        this.input.on('pointerdown', (pointer) => {
            this.scrollStartY = pointer.y;
            this.cameraStartY = cam.scrollY;
            this.isScrolling = false;
            this.dragDistance = 0;
        });

        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown) return;

            const dragY = this.scrollStartY - pointer.y;
            this.dragDistance = Math.abs(dragY);

            // Only start scrolling if dragged more than 10 pixels
            if (this.dragDistance > 10) {
                this.isScrolling = true;
                const newY = this.cameraStartY + dragY;
                cam.scrollY = Phaser.Math.Clamp(newY, 0, this.WORLD_HEIGHT - this.GAME_HEIGHT);
                this.updateScrollIndicator();
            }
        });

        this.input.on('pointerup', () => {
            // Reset scrolling flag after a short delay
            this.time.delayedCall(100, () => {
                this.isScrolling = false;
            });
        });
    }

    createScrollIndicator() {
        // Scroll dots
        this.scrollDots = this.add.container(this.GAME_WIDTH - 25, 400);
        this.scrollDots.setScrollFactor(0);  // Fixed to camera
        this.scrollDots.setDepth(50);

        // Dot 1 (page 1)
        this.dot1 = this.add.circle(0, -15, 8, 0xffffff);
        this.scrollDots.add(this.dot1);

        // Dot 2 (page 2)
        this.dot2 = this.add.circle(0, 15, 8, 0x666666);
        this.scrollDots.add(this.dot2);

        // Down arrow
        this.scrollArrow = this.add.text(
            this.GAME_WIDTH / 2,
            this.GAME_HEIGHT - 30,
            '▼ Scroll Down ▼',
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: 'rgba(102, 84, 192, 0.7)',
                padding: { x: 15, y: 8 }
            }
        );
        this.scrollArrow.setOrigin(0.5);
        this.scrollArrow.setScrollFactor(0);  // Fixed to camera
        this.scrollArrow.setDepth(50);

        // Pulse the arrow
        this.tweens.add({
            targets: this.scrollArrow,
            alpha: { from: 1, to: 0.3 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    updateScrollIndicator() {
        const cam = this.cameras.main;
        const maxScroll = this.WORLD_HEIGHT - this.GAME_HEIGHT;
        const scrollProgress = cam.scrollY / maxScroll;

        // Update dots
        if (scrollProgress < 0.5) {
            this.dot1.setFillStyle(0xffffff);
            this.dot2.setFillStyle(0x666666);
        } else {
            this.dot1.setFillStyle(0x666666);
            this.dot2.setFillStyle(0xffffff);
        }

        // Hide/show arrow
        if (scrollProgress > 0.8) {
            this.scrollArrow.setText('▲ Scroll Up ▲');
        } else {
            this.scrollArrow.setText('▼ Scroll Down ▼');
        }
    }

    // --- Angel Float Animation ---
    addAngelFloatAnimation(angel, island) {
        if (!angel || !island) return;

        const boundsX = 40;
        const boundsY = 30;
        const baseX = island.x;
        const baseY = island.y + this.ANGEL_Y_OFFSET;

        this.tweens.killTweensOf(angel);
        this.createFloatTween(angel, baseX, baseY, boundsX, boundsY);
    }

    createFloatTween(angel, baseX, baseY, boundsX, boundsY) {
        if (!angel || !angel.active) return;

        const targetX = baseX + Phaser.Math.Between(-boundsX, boundsX);
        const targetY = baseY + Phaser.Math.Between(-boundsY, boundsY);
        const duration = Phaser.Math.Between(1500, 3000);

        if (targetX < angel.x) {
            angel.setFlipX(true);
        } else {
            angel.setFlipX(false);
        }

        this.tweens.add({
            targets: angel,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (!angel || !angel.active) return;
                this.time.delayedCall(Phaser.Math.Between(200, 800), () => {
                    if (angel && angel.active) {
                        this.createFloatTween(angel, baseX, baseY, boundsX, boundsY);
                    }
                });
            }
        });
    }

    // --- Selection ---
    selectIslandForEditing(index) {
        // console.log(`Double-clicked island slot ${index}`);

        if (this.selectedIslandIndex === index) {
            this.clearSelection();
            return;
        }

        if (this.selectedIslandIndex !== null && this.islands[this.selectedIslandIndex]) {
            const previousIsland = this.islands[this.selectedIslandIndex];
            if (previousIsland && previousIsland.active) {
                this.tweens.killTweensOf(previousIsland);
                previousIsland.clearTint();
                previousIsland.setScale(this.ISLAND_SCALE);
            }
        }

        this.selectedIslandIndex = index;
        window.gameCustomization.selectedSlot = index;

        const selectedIsland = this.islands[index];
        selectedIsland.setTint(0xffff00);

        this.tweens.add({
            targets: selectedIsland,
            scale: { from: this.ISLAND_SCALE, to: this.ISLAND_PULSE_SCALE },
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.showSelectionMessage(index);
    }

    showSelectionMessage(index) {
        if (this.selectionText) {
            this.selectionText.destroy();
        }

        const slotNames = [
            'Page 1 - Top Left', 'Page 1 - Top Right',
            'Page 1 - Bottom Left', 'Page 1 - Bottom Right',
            'Page 2 - Top Left', 'Page 2 - Top Right',
            'Page 2 - Bottom Left', 'Page 2 - Bottom Right'
        ];

        this.selectionText = this.add.text(
            this.GAME_WIDTH / 2,
            this.cameras.main.scrollY + this.GAME_HEIGHT - 80,
            `Selected: ${slotNames[index]}\nClick Edit to change!`,
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: '#6654c0',
                padding: { x: 15, y: 10 },
                align: 'center'
            }
        );
        this.selectionText.setOrigin(0.5);
        this.selectionText.setScrollFactor(0);
        this.selectionText.setDepth(50);

        this.tweens.add({
            targets: this.selectionText,
            alpha: 0,
            delay: 3000,
            duration: 500,
            onComplete: () => this.selectionText?.destroy()
        });
    }

    // --- Customization Change ---
   handleCustomizationChange(customization) {
    // console.log('=== MainScene received customizationChanged ===');

    const slotToSwap = customization.selectedSlot;

    if (slotToSwap === null || slotToSwap === undefined) return;

    // Clear selection text
    if (this.selectionText) {
        this.selectionText.destroy();
        this.selectionText = null;
    }

    // Stop pulsating and clear tint on the selected island
    const selectedIsland = this.islands[slotToSwap];
    if (selectedIsland && selectedIsland.active) {
        this.tweens.killTweensOf(selectedIsland);
        selectedIsland.clearTint();
        selectedIsland.setScale(this.ISLAND_SCALE);
    }

    this.selectedIslandIndex = null;
    window.gameCustomization.selectedSlot = null;

    if (customization.selectedIsland) {
        this.swapIsland(slotToSwap, customization.selectedIsland);
    }

    if (customization.selectedAngel1 !== undefined) {
        this.swapAngel(slotToSwap, 0, customization.selectedAngel1);
    }
    if (customization.selectedAngel2 !== undefined) {
        this.swapAngel(slotToSwap, 1, customization.selectedAngel2);
    }

    if (customization.selectedAngel && !customization.selectedAngel1 && !customization.selectedAngel2) {
        this.swapAngel(slotToSwap, 0, customization.selectedAngel);
    }

    this.time.delayedCall(400, () => {
        this.coinManager?.onLayoutChange();
        this.updateCPMDisplay();
    });
}
    // --- Island Swap ---
    swapIsland(slotIndex, newIslandId) {
        // console.log(`Swapping island at slot ${slotIndex} to ${newIslandId}`);

        if (!this.textures.exists(newIslandId)) {
            console.error(`Cannot swap - texture ${newIslandId} not loaded!`);
            return;
        }

        const island = this.islands[slotIndex];
        if (!island) return;

        const x = island.x;
        const y = island.y;
        const oldClickZone = island.clickZone;

        const slotAngels = this.angels[slotIndex] || [null, null];
        slotAngels.forEach(angel => {
            if (angel && angel.active) {
                this.tweens.killTweensOf(angel);
            }
        });

        this.tweens.killTweensOf(island);
        island.clearTint();

        this.tweens.add({
            targets: island,
            scale: 0,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete: () => {
                island.destroy();

                const newIsland = this.platforms.create(x, y, newIslandId);
                newIsland.setScale(0.01).refreshBody();
                newIsland.slotIndex = slotIndex;
                newIsland.currentIslandId = newIslandId;
                newIsland.clickZone = oldClickZone;

                this.islands[slotIndex] = newIsland;

                window.gameCustomization.islandLayout[slotIndex] = newIslandId;
                localStorage.setItem('islandLayout', JSON.stringify(window.gameCustomization.islandLayout));

                this.tweens.add({
                    targets: newIsland,
                    scale: this.ISLAND_SCALE,
                    duration: 300,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        newIsland.refreshBody();
                        slotAngels.forEach(angel => {
                            if (angel && angel.active) {
                                this.addAngelFloatAnimation(angel, newIsland);
                            }
                        });
                    }
                });
            }
        });
    }

    // --- Angel Swap ---
    swapAngel(slotIndex, angelSlot, newAngelId) {
        // console.log(`Swapping angel ${angelSlot + 1} at island slot ${slotIndex} to ${newAngelId}`);

        if (!newAngelId || newAngelId === 'null' || newAngelId === 'none') {
            const existingAngel = this.angels[slotIndex]?.[angelSlot];
            if (existingAngel) {
                this.tweens.killTweensOf(existingAngel);
                this.tweens.add({
                    targets: existingAngel,
                    scale: 0, alpha: 0,
                    duration: 200,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        existingAngel.destroy();
                        this.angels[slotIndex][angelSlot] = null;
                    }
                });
            }

            if (!window.gameCustomization.angelLayout[slotIndex]) {
                window.gameCustomization.angelLayout[slotIndex] = [null, null];
            }
            window.gameCustomization.angelLayout[slotIndex][angelSlot] = null;
            localStorage.setItem('angelLayout', JSON.stringify(window.gameCustomization.angelLayout));
            return;
        }

        if (!this.textures.exists(newAngelId)) {
            console.error(`Cannot swap - angel texture ${newAngelId} not loaded!`);
            return;
        }

        const island = this.islands[slotIndex];
        if (!island) return;

        const xOffset = angelSlot === 0 ? -this.ANGEL_X_OFFSET : this.ANGEL_X_OFFSET;
        const angelX = island.x + xOffset;
        const angelY = island.y + this.ANGEL_Y_OFFSET;

        let angel = this.angels[slotIndex]?.[angelSlot];

        if (!angel) {
            angel = this.add.image(angelX, angelY, newAngelId);
            angel.setScale(0);
            angel.setAlpha(0);
            angel.setDepth(10);
            angel.currentAngelId = newAngelId;
            this.angels[slotIndex][angelSlot] = angel;

            this.tweens.add({
                targets: angel,
                alpha: 1,
                scale: this.ANGEL_SCALE,
                duration: 300,
                ease: 'Back.easeOut',
                onComplete: () => {
                    this.addAngelFloatAnimation(angel, island);
                }
            });
        } else {
            this.tweens.killTweensOf(angel);

            this.tweens.add({
                targets: angel,
                scale: 0, alpha: 0,
                duration: 200,
                ease: 'Back.easeIn',
                onComplete: () => {
                    angel.setTexture(newAngelId);
                    angel.currentAngelId = newAngelId;
                    angel.x = angelX;
                    angel.y = angelY;

                    this.tweens.add({
                        targets: angel,
                        scale: this.ANGEL_SCALE,
                        alpha: 1,
                        duration: 300,
                        ease: 'Back.easeOut',
                        onComplete: () => {
                            this.addAngelFloatAnimation(angel, island);
                        }
                    });
                }
            });
        }

        if (!window.gameCustomization.angelLayout[slotIndex]) {
            window.gameCustomization.angelLayout[slotIndex] = [null, null];
        }
        window.gameCustomization.angelLayout[slotIndex][angelSlot] = newAngelId;
        localStorage.setItem('angelLayout', JSON.stringify(window.gameCustomization.angelLayout));
    }

    // --- CPM Display ---
    updateCPMDisplay() {
        const cpm = this.coinManager?.getCoinsPerMinuteDisplay() || '0';

        let cpmDisplay = document.getElementById('cpmDisplay');
        if (!cpmDisplay) {
            cpmDisplay = document.createElement('p');
            cpmDisplay.id = 'cpmDisplay';
            const coinQty = document.getElementById('cloudCoin') || document.getElementById('coinQty');
            if (coinQty) coinQty.appendChild(cpmDisplay);
        }
        cpmDisplay.textContent = `+${cpm}/min`;
    }

    // --- Clear Selection ---
    clearSelection() {
        if (this.selectedIslandIndex !== null && this.islands[this.selectedIslandIndex]) {
            const island = this.islands[this.selectedIslandIndex];
            if (island && island.active) {
                this.tweens.killTweensOf(island);
                island.clearTint();
                island.setScale(this.ISLAND_SCALE);
            }
        }

        if (this.selectionText) {
            this.selectionText.destroy();
            this.selectionText = null;
        }

        this.selectedIslandIndex = null;
        window.gameCustomization.selectedSlot = null;
    }

    // --- Update ---
    async update() {
        if (this.playerObj) {
            this.playerObj.update();
        }

        if (this.cursors.left.isDown) {
            this.playerObj.group.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.playerObj.group.setVelocityX(160);
        }

        if (this.cursors.up.isDown && this.playerObj.body && this.playerObj.body.touching.down) {
            this.playerObj.group.setVelocityY(-330);
        }

        if (window.__settingsOpened) {
            window.__settingsOpened = false;

            musicVolume.value = this.player.settings.music;
            sfxVolume.value = this.player.settings.sfx;
            skipCutscene.checked = this.player.settings.skipGacha;
            usernameInput.value = this.player.profile.username;
        }

        if (window.__settingsSubmitted) {
            window.__settingsSubmitted = false;

            this.player.settings.music = parseInt(musicVolume.value);
            this.player.settings.sfx = parseInt(sfxVolume.value);
            this.player.settings.skipGacha = skipCutscene.checked;
            this.player.profile.username = usernameInput.value;

            await this.player.save();
            this.registry.set('player', this.player);
            this.music.setVolume(this.player.settings.music / 100);
        }

        if (window.__goToShop) {
            window.__goToShop = false;
            this.scene.start('ShopScene');
        }

        if (window.__goToExcursion) {
        window.__goToExcursion = false;
        this.scene.start('TimerScene');

        const coins = document.getElementById('coinCount');
        if (coins) coins.textContent = Math.floor(this.player.coins);
    }
}
}
