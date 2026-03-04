import Phaser from 'phaser';

import './styles/main.css';

// Scene imports
import LoginScene from './scenes/LoginScene.js';
import SignupScene from './scenes/SignupScene.js';
import TitleScene from './scenes/TitleScene.js';
import BootScene from './scenes/BootScene.js';

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

// Determine which scene to start based on player data
game.scene.add('BootScene', BootScene, true);

// Signup and Login
game.scene.add('LoginScene', LoginScene, false);
game.scene.add('SignupScene', SignupScene, false);

// Add TitleScene after checking for player data to avoid unnecessary loading
game.scene.add('TitleScene', TitleScene, false);

game.scene.start('BootScene');


            