import Phaser from "phaser";
import { initUI } from "../services/ui";
import { showUI } from "../services/ui";
import { updateCoinCount } from "../services/ui";

export default class MainScene extends Phaser.Scene {
    init() {
        this.player = this.registry.get("player");
    }

    create() {
        showUI({
            settings: true,
            home: true,
            shop: true,
            edit: true,
            info: false,
            coins: true,
            excursion: true,
        });

        updateCoinCount(this.player.coins);

        // music
        this.music = this.sound.add('theme',{
            volume: this.player.settings.music/100
        });
        this.music.setLoop(true);
        this.music.play();

        // Background
        this.cameras.main.setBackgroundColor('#87ceeb');
        this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // shutdown
        this.events.on("shutdown",() => {
            this.sound.stopAll();
        })
    }

    async update() {
        if (window.__settingsOpened) {
            window.__settingsOpened = false;

            musicVolume.value = this.player.settings.music;
            sfxVolume.value = this.player.settings.sfx;
            skipCutscene.checked = this.player.settings.skipGacha;
            usernameInput.value = this.player.profile.username;
        }

        if (window.__settingsSubmitted) {
            window.__settingsSubmitted = false;

            this.player.settings.music = parseInt(musicVolume.value);
            this.player.settings.sfx = parseInt(sfxVolume.value);
            this.player.settings.skipGacha = skipCutscene.checked;
            this.player.profile.username = usernameInput.value;

            await this.player.save();
            this.registry.set('player', this.player);
            this.music.setVolume(this.player.settings.music / 100);
        }

        if (window.__goHomeRequested) {
            window.__goHomeRequested = false;
            this.scene.start('MainScene');
        }

        if (window.__goToShop) {
            window.__goToShop = false;
            this.scene.start('ShopScene');
        }

        if (window.__goToExcursion) {
        window.__goToExcursion = false;
        this.scene.start('TimerScene');
    }

    }
}