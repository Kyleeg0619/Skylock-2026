import Phaser from "phaser";
import PlayerDataManager from "../services/PlayerDataManager.js";
import { initUI } from "../services/ui.js";
import { showUI } from "../services/ui.js";

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

        showUI({
                    settings: true,
                    home: false,
                    shop: false,
                    edit: false,
                    info: true,
                    coins: false
                });

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

        this.events.on("shutdown",() => {
            infoBtn.style.display = "none";
        })
    }

async update() {
        // When settings popup opens → populate values
        if (window.__settingsOpened) {
            window.__settingsOpened = false;

            document.getElementById('musicVolume').value = this.player.settings.music;
            document.getElementById('sfxVolume').value = this.player.settings.sfx;
            document.getElementById('skipCutscene').checked = this.player.settings.skipGacha;
            document.getElementById('usernameInput').value = this.player.profile.username;
        }

        // When settings form submits → save values
        if (window.__settingsSubmitted) {
            window.__settingsSubmitted = false;

            player.settings.music = parseInt(musicVolume.value);
            player.settings.sfx = parseInt(sfxVolume.value);
            player.settings.skipGacha = skipCutscene.checked;
            player.profile.username = usernameInput.value;

            await player.save();
            this.registry.set('player', player);
        }

        // Handle home button
        if (window.__goHomeRequested) {
            window.__goHomeRequested = false;
            this.scene.start('MainScene');
        }
    }

}