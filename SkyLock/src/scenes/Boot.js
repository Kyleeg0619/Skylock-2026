export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {

        this.load.setPath('assets');
        this.load.image('background', 'Island_bg.PNG');
    }
    create() {
        this.scene.start('Preloader');
    }
}