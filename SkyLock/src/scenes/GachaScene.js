import Phaser from "phaser";
import AuthService from "../services/AuthService";
import PlayerDataManager from "../services/PlayerDataManager";
import { initUI, showUI } from "../services/ui";
import { updateCoinCount } from "../services/ui";
import { updateAngelCoinCount } from "../services/ui";

export default class GachaScene extends Phaser.Scene {
    init() {
        this.player = this.registry.get("player");
    }

    preload() {
        // Load any assets needed for the gacha scene (e.g., background, buttons)
        this.load.image('background', 'assets/backgrounds/gacha_bg.png');
        this.load.image('cherub','assets/angels/cherub-rise.png');

        // Buttons
        this.load.image('b1', 'assets/icons/button_summon1.png');
        this.load.image('b5', 'assets/icons/button_summon5.png');
    }

    create() {
        console.log("Player data in GachaScene:", this.player);
        showUI({
            settings: true,
            home: true,
            shop: true,
            edit: false,
            info: false,
            coins: true,
            excursion: false,
            angelcoins: true
        });

            updateCoinCount(this.player.coins);
            updateAngelCoinCount(this.player.angelCoins);

        // Background
        this.cameras.main.setBackgroundColor('#f0e68c');
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Summon Buttons
        const summon1Button = this.add.image(0, 0, 'b1').setInteractive().on('pointerdown', () => this.smnGacha(1));
        const summon5Button = this.add.image(0, 0, 'b5').setInteractive().on('pointerdown', () => this.smnGacha(5));

        summon5Button.setOrigin(1,1).setPosition(this.sys.game.config.width - 50, this.sys.game.config.height - 50);
        summon1Button.setOrigin(1,1).setPosition(this.sys.game.config.width - 50, this.sys.game.config.height - 225);
    }

    async update() {
        // Any animations or updates for the gacha scene can go here

        // Example: Check for button clicks or animate characters
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
    }

    smnGacha(count) {
        console.log(`Summoning ${count} times!`);
    }
}