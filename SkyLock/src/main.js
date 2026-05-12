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
import ShopScene from './scenes/ShopScene.js';
import IslandShopScene from './scenes/IslandShopScene.js';
import TimerScene from './scenes/TimerScene.js';
import ExcursionScene from './scenes/ExcursionScene.js';
import GachaScene from './scenes/GachaScene.js';
import RollScene from './scenes/RollScene.js';
import GachaResultScene from './scenes/GachaResultScene.js';

const sizes = {
    width: 600,
    height: 800
}

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
    initEditPopup(game);
};

window.addEventListener("message", (event) => {
    if (event.data?.type === "SKYLOCK_OPEN_TABS") {
        window.__skylockDistraction  = true;
    }
});

// Determine which scene to start based on player data
game.scene.add('ShopScene', ShopScene, false);

game.scene.add('BootScene', BootScene, true); // Start BootScene immediately to check auth state

// Signup and Login
game.scene.add('LoginScene', LoginScene, false);
game.scene.add('SignupScene', SignupScene, false);

// Add TitleScene after checking for player data to avoid unnecessary loading
game.scene.add('TitleScene', TitleScene, false);

game.scene.add('MainScene', MainScene, false);
game.scene.add('TimerScene', TimerScene, false);
game.scene.add('ExcursionScene', ExcursionScene, false);

game.scene.add('GachaScene', GachaScene, false);
game.scene.add('RollScene', RollScene, false);
game.scene.add('GachaResultScene', GachaResultScene, false);

// Shop Scenes 
game.scene.add('IslandShopScene', IslandShopScene, false);



            
