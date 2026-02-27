import Phaser from "phaser";
import PlayerDataManager from "../services/PlayerDataManager";

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    init() {
        this.player = this.registry.get('player'); // Ensure player data is loaded into registry
    }

    preload() {
        this.load.image('bg', 'assets/backgrounds/island_bg.png');
        this.load.image('logo', 'assets/icons/logo.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        const logo = this.add.image(this.sys.game.config.width / 2, 150, 'logo');
        logo.setScale(0.5);
        const welcomeText = this.add.text(this.sys.game.config.width / 2, 300, `Welcome, ${this.player.profile.username}!`, {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
    }
}
