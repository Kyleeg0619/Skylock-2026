import Phaser from 'phaser';
import { AngelRegistry } from '../data/AngelRegistry.js';
import { IslandRegistry } from '../data/IslandRegistry.js';

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        console.log('=== PRELOADER STARTING ===');

        // Show loading text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Set base path
        this.load.setPath('assets');

        // Load background
        this.load.image('bg', 'backgrounds/island_bg.png');

        // Load ALL angels from registry
        console.log('Loading angels...');
        Object.entries(AngelRegistry).forEach(([key, angel]) => {
            this.load.image(key, `angels/${angel.sprite}`);
        });

        // Load ALL islands from registry
        console.log('Loading islands...');
        Object.entries(IslandRegistry).forEach(([key, island]) => {
            this.load.image(key, `islands/${island.sprite}`);
        });

        // Load other assets
        // this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
        // this.load.spritesheet('dude2', 'guy2.png', { frameWidth: 341, frameHeight: 341 });

        // Track progress
        this.load.on('progress', (value) => {
            this.loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
        });

        // Handle errors
        this.load.on('loaderror', (file) => {
            console.warn(`Failed to load: ${file.key}`);
        });
    }

    create() {
        console.log('=== PRELOADER COMPLETE ===');
        console.log('Loaded textures:', this.textures.getTextureKeys());
        
        // Destroy loading text
        if (this.loadingText) {
            this.loadingText.destroy();
        }

        // NOW start MainScene - textures are loaded!
        this.scene.start('MainScene');
    }
}