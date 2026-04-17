import Phaser from "phaser";
import PlayerDataManager from "../services/PlayerDataManager.js";
import { initUI } from "../services/ui.js";
import { showUI } from "../services/ui.js";

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    init() {
        console.log("Registry player:", this.registry.get("player"));
        this.player = this.registry.get("player");
        console.log(this.player.profile.username);
    }

    preload() {
        this.load.image('title-bg', 'assets/backgrounds/Title_bg.PNG');
    }

    create() {
        this.add.image(0, 0, 'title-bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        showUI({
            settings: true,
            home: false,
            shop: false,
            edit: false,
            info: true,
            coins: false
        });

        // Use the existing HTML play button
        const playBtn = document.querySelector('.playBtn');
        if (playBtn) {
            playBtn.style.display = 'flex';
            
            // Remove old listeners and add new one
            const newPlayBtn = playBtn.cloneNode(true);
            playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
            
            newPlayBtn.addEventListener('click', () => {
                newPlayBtn.style.display = 'none';
                this.scene.start('Preloader');
            });
        }

        this.events.on("shutdown", () => {
            // Hide play button when leaving TitleScene
            const playButton = document.querySelector('.playBtn');
            if (playButton) playButton.style.display = 'none';
            
            const infoBtn = document.getElementById('infoBtn');
            if (infoBtn) infoBtn.style.display = "none";
        });
    }

    async update() {
        if (window.__settingsOpened) {
            window.__settingsOpened = false;

            document.getElementById('musicVolume').value = this.player.settings.music;
            document.getElementById('sfxVolume').value = this.player.settings.sfx;
            document.getElementById('skipCutscene').checked = this.player.settings.skipGacha;
            document.getElementById('usernameInput').value = this.player.profile.username;
        }

        if (window.__settingsSubmitted) {
            window.__settingsSubmitted = false;

            this.player.settings.music = parseInt(document.getElementById('musicVolume').value);
            this.player.settings.sfx = parseInt(document.getElementById('sfxVolume').value);
            this.player.settings.skipGacha = document.getElementById('skipCutscene').checked;
            this.player.profile.username = document.getElementById('usernameInput').value;

            await this.player.save();
            this.registry.set('player', this.player);
        }

        if (window.__goHomeRequested) {
            window.__goHomeRequested = false;
            
            // Hide play button before going to MainScene
            const playBtn = document.querySelector('.playBtn');
            if (playBtn) playBtn.style.display = 'none';
            
            this.scene.start('Preloader');  // <-- Go to Preloader first, NOT MainScene!
        }
    }
}