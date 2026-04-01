import Phaser from "phaser";
import { initUI } from "../services/ui";
import { showUI } from "../services/ui";

export default class ExcursionScene extends Phaser.Scene {
    init(data) {
        this.player = this.registry.get("player");
        this.timer = data.timer || 0; // Timer in seconds
    }  

    preload() {
        this.load.image('excursion_bg', 'assets/backgrounds/excursion_bg.png');
    }

    create() {
        showUI({
            settings: true,
            home: false,
            shop: false,
            edit: false,
            info: false,
            coins: true,
            excursion: false
        });

        // Background
        this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'excursion_bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    }
}