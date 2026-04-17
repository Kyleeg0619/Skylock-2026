import Phaser from "phaser";

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('logo', 'assets/phaser.png');
    }

    create() {
        this.add.text(400, 300, 'Hello Phaser!', { font: '48px Arial', fill: '#ffffff' });
    }
}