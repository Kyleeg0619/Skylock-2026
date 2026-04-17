import Phaser from 'phaser';
import { initUI } from './services/ui.js';
import { loadCustomization, updateOwnedItems, unlockItem, defaultCustomization } from './services/customization.js';
import { initEditPopup } from './services/editPopup.js';

import './styles/main.css';

// Scene imports
import LoginScene from './scenes/LoginScene.js';
import SignupScene from './scenes/SignupScene.js';
import TitleScene from './scenes/TitleScene.js';
import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';
import { Preloader } from './scenes/Preloader.js';
import { Game } from './scenes/Game.js';

const config = {
    type: Phaser.WEBGL,
    width: 600,
    height: 800,
    canvas: document.getElementById('gameCanvas'),
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    dom: {
        createContainer: true,
        behindCanvas: false,
    }
};

const game = new Phaser.Game(config);

// Initialize global customization state
window.gameCustomization = { ...defaultCustomization };

// Make helper functions globally accessible for Phaser scenes
window.updateOwnedItems = updateOwnedItems;
window.unlockItem = unlockItem;

// Initialize UI on page load
window.onload = () => {
    initUI();
    initEditPopup(game);  // Pass game instance so it can emit events
    loadCustomization();
};

// Scene Management
game.scene.add('Preloader', Preloader);
game.scene.add('Game', Game);
game.scene.add('LoginScene', LoginScene);
game.scene.add('SignupScene', SignupScene);
game.scene.add('TitleScene', TitleScene);
game.scene.add('MainScene', MainScene);
game.scene.add('BootScene', BootScene, true);