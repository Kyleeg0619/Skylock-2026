import Phaser from "phaser";
import { initUI } from "../services/ui";

export default class MainScene extends Phaser.Scene {
    init() {
        this.player = this.registry.get("player");
    }

    preload() {
        this.load.image('bg', 'assets/backgrounds/island_bg.png');
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Display UI elements
        const settingsBtn = document.getElementById('settingsBtn');
        const homeBtn = document.getElementById('homeBtn');
        const shopBtn = document.getElementById('shopBtn');
        const editBtn = document.getElementById('editBtn');
        const infoBtn = document.getElementById('infoBtn');

        settingsBtn.style.display = 'block';
        homeBtn.style.display = 'block';
        shopBtn.style.display = 'block';
        editBtn.style.display = 'block';
        infoBtn.style.display = 'none';

            // handle home button request
        if (window.__goHomeRequested) {
            this.scene.start('MainScene');
            window.__goHomeRequested = false;
        }

    }
}