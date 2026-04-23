import Phaser from 'phaser';
import { initUI } from './services/ui.js';

import './styles/main.css';

// Scene imports
import LoginScene from './scenes/LoginScene.js';
import SignupScene from './scenes/SignupScene.js';
import TitleScene from './scenes/TitleScene.js';
import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';
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
    width: sizes.width,
    height: sizes.height,
    canvas: document.getElementById('gameCanvas'),
    parent: 'game-container',
    dom: {
        createContainer: true,
        behindCanvas: false,
    }
    
};

const game = new Phaser.Game(config);

// main.js
window.onload = () => {
    // initialize UI once when the page loads
    initUI();
};

window.addEventListener("message", (event) => {
    if (event.data?.type === "SKYLOCK_OPEN_TABS") {
        console.log("Global Distraction Event:", event.data.urls);
        window.__skylockDistraction  = true;
    }
});

// Determine which scene to start based on player data
game.scene.add('BootScene', BootScene, true);

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

game.scene.start('BootScene');


            