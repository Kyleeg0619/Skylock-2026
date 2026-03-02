import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene.js';
import './styles/base.css';


const sizes = {
    width: 400,
    height: 700
};

const config = {
    type: Phaser.WEBGL,
    width: sizes.width,
    height: sizes.height,
    parent: 'gameContainer',
    scene: [TitleScene],
    dom: {
        createContainer: true // dom element for screen popups pleaaaaaaaaaaase work 
    }
};

new Phaser.Game(config);