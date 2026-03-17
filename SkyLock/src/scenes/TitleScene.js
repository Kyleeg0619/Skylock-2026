import Phaser from "phaser";
import PlayerDataManager from "../services/PlayerDataManager.js";
import { initUI } from "../services/ui.js";

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    init() {
        // Check if player data exists in the registry
        console.log("Registry player:", this.registry.get("player"));
        this.player = this.registry.get("player");
        console.log(this.player.profile.username);
    }

    preload() {
        this.load.image('title-bg', 'assets/backgrounds/Title_bg.PNG');
    }

    create() {
        this.add.image(0, 0, 'title-bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // --- play btn ---
        const playBtn = document.createElement('button');
        playBtn.className = 'playBtn';
        playBtn.innerHTML = '<span class="btn-label"> PLAY </span>';

        playBtn.addEventListener('click', () => {
            this.scene.start('MainScene');
            playBtn.remove();
        });

        const container = document.getElementById('game-container');
        container.appendChild(playBtn);

        // --- settings & info buttons ---
        const infoBtn = document.getElementById('infoBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const homeBtn = document.getElementById('homeBtn');
        const shopBtn = document.getElementById('shopBtn');
        const editBtn = document.getElementById('editBtn');

        infoBtn.style.display = "block";
        settingsBtn.style.display = "block";
        homeBtn.style.display = "none";
        shopBtn.style.display = "none";
        editBtn.style.display = "none";

        if (!this.infoUIInitialized) {
        this.initInfoUI();
        this.infoUIInitialized = true;
    }

        this.events.on("shutdown",() => {
            infoBtn.style.display = "none";
        })
    }
}