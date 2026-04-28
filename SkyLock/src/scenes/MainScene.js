import Phaser from "phaser";
import { showUI } from "../services/ui";
import { Player } from '../gameObjects/Player.js';
import { IslandRegistry } from '../data/IslandRegistry.js';
import { AngelRegistry } from '../data/AngelRegistry.js';
import CoinManager from '../services/CoinManager.js';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.islands = [];
        this.angels = [];  // Now array of arrays: [[angel1, angel2], [angel1, angel2], ...]
        this.selectedIslandIndex = null;
        this.assetsLoaded = false;
        this.coinManager = null;
        
        // Size constants
        this.ISLAND_SCALE = 0.4;
        this.ISLAND_PULSE_SCALE = 0.35;
        this.ANGEL_SCALE = 0.15;
        this.ANGEL_Y_OFFSET = -50;
        this.ANGEL_X_OFFSET = 40;  // Horizontal spacing between angels
    }

    init() {
        this.player = this.registry.get("player");
        console.log('Player data loaded:', this.player);
    }

    preload() {
        if (this.textures.exists('starter-island')) {
            console.log('Textures already loaded');
            this.assetsLoaded = true;
            return;
        }

        console.log('MainScene: Loading missing textures...');
        
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
    console.log('MainScene started');
    console.log('Available textures:', this.textures.getTextureKeys());

    showUI({
        settings: true,
        home: true,
        shop: true,
        edit: true,
        info: false,
        coins: true
    });

    this.cameras.main.setBackgroundColor('#87ceeb');
    
    if (this.textures.exists('bg')) {
        this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    }

    const ownedIslands = this.player?.islands?.owned || ['starter-island'];
    const ownedAngels = this.player?.angels?.owned || ['dog-1'];
    
    console.log('Player owns these islands:', ownedIslands);
    console.log('Player owns these angels:', ownedAngels);

    const defaultIsland = ownedIslands[0] || 'starter-island';
    const defaultAngel = ownedAngels[0] || 'dog-1';
    
    let savedIslandLayout;
    try {
        savedIslandLayout = JSON.parse(localStorage.getItem('islandLayout')) || 
            [defaultIsland, defaultIsland, defaultIsland, defaultIsland];
    } catch (e) {
        savedIslandLayout = [defaultIsland, defaultIsland, defaultIsland, defaultIsland];
    }
    
    let savedAngelLayout;
    try {
        savedAngelLayout = JSON.parse(localStorage.getItem('angelLayout'));
        if (savedAngelLayout && !Array.isArray(savedAngelLayout[0])) {
            savedAngelLayout = savedAngelLayout.map(angel => [angel, null]);
        }
        if (!savedAngelLayout) {
            savedAngelLayout = [[defaultAngel, null], [null, null], [null, null], [null, null]];
        }
    } catch (e) {
        savedAngelLayout = [[defaultAngel, null], [null, null], [null, null], [null, null]];
    }

    console.log('Using island layout:', savedIslandLayout);
    console.log('Using angel layout:', savedAngelLayout);

    const positions = [
        { x: 120, y: 190 },
        { x: 470, y: 190 },
        { x: 120, y: 540 },
        { x: 470, y: 540 }
    ];

    this.platforms = this.physics.add.staticGroup();
    this.islands = [];
    this.angels = [];

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

        // Create invisible click zone ABOVE everything
        const clickZone = this.add.zone(pos.x, pos.y, 150, 150);
        clickZone.setInteractive();
        clickZone.setDepth(20);
        island.clickZone = clickZone;

        // Double-click on the zone
        clickZone.on('pointerdown', () => {
            const clickDelay = this.time.now - (clickZone.lastClickTime || 0);
            if (clickDelay < 300) {
                this.selectIslandForEditing(index);
            }
            clickZone.lastClickTime = this.time.now;
        });

        // Create 2 angels per island
        const islandAngels = [];

        // Angel 1 (left side)
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

        // Angel 2 (right side)
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

    this.playerObj = new Player(this, 100, 450);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.game.events.off('customizationChanged', this.handleCustomizationChange, this);
    this.game.events.on('customizationChanged', this.handleCustomizationChange, this);

    window.gameCustomization = window.gameCustomization || {};
    window.gameCustomization.selectedSlot = null;
    window.gameCustomization.islandLayout = savedIslandLayout;
    window.gameCustomization.angelLayout = savedAngelLayout;
    window.gameCustomization.ownedIslands = ownedIslands;
    window.gameCustomization.ownedAngels = ownedAngels;

    this.coinManager = new CoinManager(this.player);
    this.coinManager.start();
    this.updateCPMDisplay();

    console.log('MainScene ready!');
}

swapIsland(slotIndex, newIslandId) {
    console.log(`Swapping island at slot ${slotIndex} to ${newIslandId}`);

    if (!this.textures.exists(newIslandId)) {
        console.error(`Cannot swap - texture ${newIslandId} not loaded!`);
        return;
    }

    const island = this.islands[slotIndex];
    if (!island) return;

    const x = island.x;
    const y = island.y;
    const oldClickZone = island.clickZone;

    // Pause angel animations during island swap
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
            // Destroy old island but keep click zone
            island.destroy();

            const newIsland = this.platforms.create(x, y, newIslandId);
            newIsland.setScale(0.01).refreshBody();
            newIsland.slotIndex = slotIndex;
            newIsland.currentIslandId = newIslandId;

            // Reuse existing click zone
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

                    // Restart angel animations
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

     // Update CPM display
    updateCPMDisplay() {
        const cpm = this.coinManager?.getCoinsPerMinuteDisplay() || '0';
        
        // Update or create CPM display
        let cpmDisplay = document.getElementById('cpmDisplay');
        if (!cpmDisplay) {
            cpmDisplay = document.createElement('p');
            cpmDisplay.id = 'cpmDisplay';
            const coinQty = document.getElementById('coinQty');
            if (coinQty) coinQty.appendChild(cpmDisplay);
        }
        cpmDisplay.textContent = `+${cpm}/min`;
    }

    handleCustomizationChange(customization) {
        console.log('=== MainScene received customizationChanged ===');
        console.log('Customization data:', customization);

        const slotToSwap = customization.selectedSlot;

        if (slotToSwap === null || slotToSwap === undefined) {
            console.log('No slot specified');
            return;
        }

        // Clear selection text and state FIRST
        if (this.selectionText) {
            this.selectionText.destroy();
            this.selectionText = null;
        }
        this.selectedIslandIndex = null;
        window.gameCustomization.selectedSlot = null;

        if (customization.selectedIsland) {
            this.swapIsland(slotToSwap, customization.selectedIsland);
        }

        // Handle angel swaps (now with angel slot: 0 or 1)
        if (customization.selectedAngel1 !== undefined) {
            this.swapAngel(slotToSwap, 0, customization.selectedAngel1);
        }
        if (customization.selectedAngel2 !== undefined) {
            this.swapAngel(slotToSwap, 1, customization.selectedAngel2);
        }

        // Recalculate coins per minute after swap
        this.time.delayedCall(400, () => {
            this.coinManager?.onLayoutChange();
            this.updateCPMDisplay();
        });
        
        // Backwards compatibility - if just selectedAngel, put in slot 0
        if (customization.selectedAngel && !customization.selectedAngel1 && !customization.selectedAngel2) {
            this.swapAngel(slotToSwap, 0, customization.selectedAngel);
        }
    }

    swapAngel(slotIndex, angelSlot, newAngelId) {
    console.log(`Swapping angel ${angelSlot + 1} at island slot ${slotIndex} to ${newAngelId}`);

    // Handle removal
    if (!newAngelId || newAngelId === 'null' || newAngelId === 'none') {
        const existingAngel = this.angels[slotIndex][angelSlot];
        if (existingAngel) {
            this.tweens.killTweensOf(existingAngel);
            this.tweens.add({
                targets: existingAngel,
                scale: 0,
                alpha: 0,
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

    let angel = this.angels[slotIndex][angelSlot];

    if (!angel) {
        // Create new angel
        angel = this.add.image(angelX, angelY, newAngelId);
        angel.setScale(0);
        angel.setAlpha(0);
        angel.setDepth(10);
        angel.currentAngelId = newAngelId;
        angel.disableInteractive();
        this.angels[slotIndex][angelSlot] = angel;

        this.tweens.add({
            targets: angel,
            alpha: 1,
            scale: this.ANGEL_SCALE,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Start floating after appear animation
                this.addAngelFloatAnimation(angel, island);
            }
        });
    } else {
        // Stop existing animations
        this.tweens.killTweensOf(angel);

        // Swap existing angel
        this.tweens.add({
            targets: angel,
            scale: 0,
            alpha: 0,
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
                        // Start floating after swap animation
                        this.addAngelFloatAnimation(angel, island);
                    }
                });
            }
        });
    }

    // Save layout
    if (!window.gameCustomization.angelLayout[slotIndex]) {
        window.gameCustomization.angelLayout[slotIndex] = [null, null];
    }
    window.gameCustomization.angelLayout[slotIndex][angelSlot] = newAngelId;
    localStorage.setItem('angelLayout', JSON.stringify(window.gameCustomization.angelLayout));
    console.log('Angel layout saved:', window.gameCustomization.angelLayout);
}

    selectIslandForEditing(index) {
        console.log(`Double-clicked island slot ${index}`);

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

        const island = this.islands[index];
        this.selectionText = this.add.text(
            island.x,
            island.y - 80,
            `Edit Slot ${index + 1}`,
            {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.selectionText.setOrigin(0.5);
        this.selectionText.setDepth(100);
    }

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


 addAngelFloatAnimation(angel, island) {
    if (!angel || !island) return;

    const boundsX = 40;
    const boundsY = 30;
    const baseX = island.x;
    const baseY = island.y + this.ANGEL_Y_OFFSET;

    // Kill any existing tweens on this angel
    this.tweens.killTweensOf(angel);

    // Start movement
    this.createFloatTween(angel, baseX, baseY, boundsX, boundsY);
}

createFloatTween(angel, baseX, baseY, boundsX, boundsY) {
    if (!angel || !angel.active) return;

    // Random target position within bounds
    const targetX = baseX + Phaser.Math.Between(-boundsX, boundsX);
    const targetY = baseY + Phaser.Math.Between(-boundsY, boundsY);

    // Random duration for natural movement
    const duration = Phaser.Math.Between(1500, 3000);

    // Flip angel based on direction
    if (targetX < angel.x) {
        angel.setFlipX(true);
    } else {
        angel.setFlipX(false);
    }

    // Move to new position with bobbing built in
    this.tweens.add({
        targets: angel,
        x: targetX,
        y: targetY,
        duration: duration,
        ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
            // Add subtle bobbing during movement
            const progress = tween.progress;
            const bob = Math.sin(progress * Math.PI * 4) * 3;
            angel.y = angel.y + bob * 0.05;
        },
        onComplete: () => {
            if (!angel || !angel.active) return;
            
            // Small pause then move again
            this.time.delayedCall(Phaser.Math.Between(200, 800), () => {
                if (angel && angel.active) {
                    this.createFloatTween(angel, baseX, baseY, boundsX, boundsY);
                }
            });
        }
    });
}

createFloatTween(angel, baseX, baseY, boundsX, boundsY) {
    if (!angel || !angel.active) return;

    // Random target position within bounds
    const targetX = baseX + Phaser.Math.Between(-boundsX, boundsX);
    const targetY = baseY + Phaser.Math.Between(-boundsY, boundsY);

    // Random duration for natural movement
    const duration = Phaser.Math.Between(1500, 3000);

    // Flip angel based on direction
    if (targetX < angel.x) {
        angel.setFlipX(true);
    } else {
        angel.setFlipX(false);
    }

    // Move to new position
    this.tweens.add({
        targets: angel,
        x: targetX,
        y: targetY,
        duration: duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
            // Small pause then move again
            this.time.delayedCall(Phaser.Math.Between(200, 800), () => {
                this.createFloatTween(angel, baseX, baseY, boundsX, boundsY);
            });
        }
    });

    // Add gentle bobbing (up and down)
    this.tweens.add({
        targets: angel,
        y: angel.y - 5,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}


    update() {
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
            this.player.save();
            this.registry.set('player', this.player);
        }

        if (window.__goHomeRequested) {
            window.__goHomeRequested = false;
            this.scene.start('MainScene');
        }

        const coins = document.getElementById('coinCount');
        if (coins) coins.textContent = Math.floor(this.player.coins);
    }



    shutdown() {
        this.coinManager?.stop();
        this.game.events.off('customizationChanged', this.handleCustomizationChange, this);
    }
}